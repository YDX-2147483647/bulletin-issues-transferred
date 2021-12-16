import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import chalk from "chalk"

import { parse_date } from '../lib/my_date.js'



export interface SourceRaw {
    name: string, full_name?: string, alt_name?: string[],
    url: string, guide?: string[],
    selectors: {
        rows: string,
        link?: string, title?: string,
        date?: string
    }
}
export class Source {
    name: string
    full_name: string
    alt_name: string[]
    url: string
    guide: string[]
    selectors: {
        rows: string,
        link: string,
        title: string,
        date: string
    }

    constructor({
        name, full_name = '', alt_name = [],
        url, guide = [],
        selectors: {
            rows,
            link = 'a', title = '',
            date = 'span'
        }
    }: SourceRaw) {
        this.name = name
        this.full_name = full_name || name
        this.alt_name = alt_name
        this.guide = guide
        this.url = url
        this.selectors = { rows, link, date, title: title || link }
    }

    _row_to_notice(row: Element) {
        const link: HTMLAnchorElement = row.querySelector(this.selectors.link)
        const title = row.querySelector(this.selectors.title)
        const date = this.selectors.date ? row.querySelector(this.selectors.date) : null

        return new Notice({
            link: (new URL(link.href, this.url)).href,
            title: title.textContent.trim(),
            date: date ? parse_date(date.textContent) : null,
            source: this
        })
    }

    async fetch_notice() {
        const html = await (await fetch(this.url)).text()
        const dom = new JSDOM(html)

        const rows = dom.window.document.querySelectorAll(this.selectors.rows)

        return Array.from(rows).map(row => this._row_to_notice(row))
    }
}


export interface NoticeRaw {
    link: string,
    title: string,
    date: Date | null,
    source?: string
}

export interface NoticeInterface {
    link: string,
    title: string,
    date: Date | null,
    source: Source | string
}

export class Notice implements NoticeInterface {
    link: string
    title: string
    date: Date | null
    source: Source | string

    constructor({ link, title, date, source }: NoticeRaw | NoticeInterface,
        { sources_set }: { sources_set?: Source[] } = {}) {
        this.link = link
        this.title = title
        this.date = date

        if (sources_set && typeof source === 'string') {
            this.source = sources_set.find(s => s.name === source)
            if (!this.source) {
                console.log(chalk.yellow(`⚠ 未知的来源：${source}。将保留原状。`))
            }
        }
        this.source ||= source
    }

    get source_name() {
        return this.source instanceof Source ? this.source.name : this.source
    }

    to_human_readable_rows() {
        return [
            `${this.source_name}｜${this.title}`,
            this.link,
            this.date ? this.date.toLocaleString() : '（未知日期）'
        ]
    }

    to_raw() {
        return {
            link: this.link,
            title: this.title,
            date: this.date,
            source: this.source_name
        } as NoticeRaw
    }
    valueOf() {
        return this.to_raw()
    }
}


export async function fetch_all_sources(sources: Source[], { verbose = true } = {}) {
    if (verbose) {
        console.log(chalk.green('🛈'), `发现${sources.length}个通知来源。`)
    }

    const notices_grouped = await Promise.all(sources.map(async s => {
        const notices = await s.fetch_notice()
        if (notices.length === 0) {
            console.log(chalk.yellow(`⚠ 未从“${s.name}”获取到任何通知。将忽略。`))
        } else if (verbose) {
            console.log(chalk.green('🛈'), `从“${s.name}”获取到${notices.length}项通知。`)
        }
        return notices
    }))
    return notices_grouped.flat()
}

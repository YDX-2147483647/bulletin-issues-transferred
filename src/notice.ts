import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import { readFile } from 'fs/promises'
import chalk from "chalk"
import { parse_date } from './lib/my_date.js'


interface SourceRaw {
    name: string,
    full_name?: string,
    guide?: string[],
    url: string,
    selectors: {
        rows: string,
        link?: string,
        title?: string,
        date?: string
    }
}
export class Source {
    name: string
    full_name: string
    url: string
    guide?: string[]
    selectors: {
        rows: string,
        link: string,
        title: string,
        date: string
    }

    constructor({ name,
        full_name = '',
        guide = [],
        url,
        selectors: {
            rows,
            link = 'a',
            title = '',
            date = 'span'
        }
    }: SourceRaw) {
        this.name = name
        this.full_name = full_name || name
        this.guide = guide
        this.url = url
        this.selectors = { rows, link, date, title: title || link }
    }

    _row_to_notice(row: Element) {
        const link: HTMLAnchorElement = row.querySelector(this.selectors.link)
        const title = row.querySelector(this.selectors.title)
        const date = this.selectors.date ? row.querySelector(this.selectors.date) : null

        return {
            link: (new URL(link.href, this.url)).href,
            title: title.textContent,
            date: date ? parse_date(date.textContent) : null,
            source: this
        } as Notice
    }

    async fetch_notice() {
        const html = await (await fetch(this.url)).text()
        const dom = new JSDOM(html)

        const rows = dom.window.document.querySelectorAll(this.selectors.rows)

        const notices = Array.from(rows).map(row => this._row_to_notice(row))

        if (notices.length > 0) {
            console.log(chalk.green(`已从“${this.name}”获取到${notices.length}项通知。`))
        } else {
            console.log(chalk.yellow(`未从“${this.name}”获取到任何通知。`))
        }

        return notices
    }
}

export interface Notice {
    link: string,
    title: string,
    date: Date | null,
    source?: Source
}

export async function import_sources() {
    const file = await readFile('config/notice_sources.json')
    const raw_sources: SourceRaw[] = JSON.parse(file.toString()).sources
    const sources = raw_sources.map(r => new Source(r))
    if (sources.length > 0) {
        console.log(chalk.green(`已发现${sources.length}个通知来源。`))
    } else {
        console.log(chalk.red('未找到任何通知来源。'))
    }
    return sources
}


export async function fetch_all_sources() {
    const sources = await import_sources()
    const notices = await Promise.all(sources.map(s => s.fetch_notice()))
    return notices.flat()
}

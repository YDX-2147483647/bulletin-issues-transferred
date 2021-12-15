import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import { readFile } from 'fs/promises'
import chalk from "chalk"
import { parse_date } from '../lib/my_date.js'


interface SourceRaw {
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
    guide?: string[]
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

        return {
            link: (new URL(link.href, this.url)).href,
            title: title.textContent.trim(),
            date: date ? parse_date(date.textContent) : null,
            source: this
        } as Notice
    }

    async fetch_notice() {
        const html = await (await fetch(this.url)).text()
        const dom = new JSDOM(html)

        const rows = dom.window.document.querySelectorAll(this.selectors.rows)

        return Array.from(rows).map(row => this._row_to_notice(row))
    }
}

export interface Notice {
    link: string,
    title: string,
    date: Date | null,
    source?: Source
}



async function _import_sources() {
    const file = await readFile('config/notice_sources.json')
    const raw_sources: SourceRaw[] = JSON.parse(file.toString()).sources
    const sources = raw_sources.map(r => new Source(r))
    return sources
}

let _sources_cache = []
export async function import_sources({ force = false } = {}) {
    if (force || _sources_cache.length == 0) {
        _sources_cache = await _import_sources()
    }

    if (_sources_cache.length === 0) {
        console.log(chalk.red('✗ 未找到任何通知来源。'))
    }
    return _sources_cache
}


export async function fetch_all_sources({ verbose = true } = {}) {
    const sources = await import_sources()
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


export function notices_json_replacer(key: string, value: any) {
    if (key === 'source') {
        return value.name
    }
    return value
}

export function notices_json_reviver(sources: Source[]) {
    return (key: string, value: any) => {
        if (key === 'date') {
            return new Date(value)
        } else if (key === 'source') {
            const real_source = sources.find(s => s.name === value)
            if (!real_source) {
                console.log(chalk.yellow(`⚠ 未知的来源：${value}。将保留原状。`))
            }
            return real_source || value
        }
        return value
    }
}

export function notices_to_human_readable(notices: Notice[]) {
    return notices.map((notice, index) => [
        chalk.underline(String(index + 1).padStart(2, ' ')) +
        `  ${notice.source.name}｜${notice.title}`,
        `    ${notice.link}`,
        `    ${notice.date ? notice.date.toLocaleString() : '（未知日期）'}`
    ].join('\n')).join('\n\n')
}


import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import { readFile } from 'fs/promises'


interface SourceRaw {
    name: string,
    guide?: string[],
    url: string,
    selectors: {
        rows: string,
        link?: string,
        date?: string
    }
}
export class Source {
    name: string
    guide?: string[]
    url: string
    selectors: {
        rows: string,
        link: string,
        date: string
    }

    constructor({ name,
        guide = [],
        url,
        selectors: {
            rows,
            link = 'a',
            date = 'span'
        }
    }: SourceRaw) {
        this.name = name
        this.guide = guide
        this.url = url
        this.selectors = { rows, link, date }
    }

    async fetch_notice() {
        const html = await (await fetch(this.url)).text()
        const dom = new JSDOM(html)

        const rows = dom.window.document.querySelectorAll(this.selectors.rows)

        return Array.from(rows).map(row => {
            const link: HTMLAnchorElement = row.querySelector(this.selectors.link)
            const date = row.querySelector(this.selectors.date)

            return {
                link: (new URL(link.href, this.url)).href,
                title: link.textContent,
                date: new Date(date.textContent),
                source: this
            } as Notice
        })
    }
}

export interface Notice {
    link: string,
    title: string,
    date: Date,
    source?: Source
}

export async function import_sources() {
    const file = await readFile('notice_sources.json')
    const raw_sources: SourceRaw[] = JSON.parse(file.toString()).sources
    return raw_sources.map(r => new Source(r))
}


export async function fetch_all_sources() {
    const sources = await import_sources()
    const notices = await Promise.all(sources.map(s => s.fetch_notice()))
    return notices.flat()
}

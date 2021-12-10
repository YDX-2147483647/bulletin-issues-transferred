import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import { readFile } from 'fs/promises'

interface Source {
    name: string,
    guide?: string[],
    url: string,
    selectors: {
        rows: string,
        link: string,
        date: string
    }
}

interface Notice {
    link: string,
    title: string,
    date: Date,
    source?: Source
}


function pad({ name,
    guide = [],
    url,
    selectors: {
        rows,
        link = 'a',
        date = 'span'
    }
}: {
    name: string,
    guide?: string[],
    url: string,
    selectors: {
        rows: string,
        link?: string,
        date?: string
    }
}) {
    return {
        name, guide, url, selectors: {
            rows, link, date
        }
    } as Source
}

async function import_sources() {
    const file = await readFile('notice_sources.json')
    return JSON.parse(file.toString()).sources.map(pad) as Source[]
}

async function fetch_source(source: Source) {
    const html = await (await fetch(source.url)).text()
    const dom = new JSDOM(html)

    const rows = dom.window.document.querySelectorAll(source.selectors.rows)

    return Array.from(rows).map(row => {
        const link: HTMLAnchorElement = row.querySelector(source.selectors.link)
        const date = row.querySelector(source.selectors.date)

        return {
            link: (new URL(link.href, source.url)).href,
            title: link.textContent,
            date: new Date(date.textContent),
            source
        } as Notice
    })
}



const promises = (await import_sources()).map(fetch_source)
const results = await Promise.all(promises)
results.map(console.log)

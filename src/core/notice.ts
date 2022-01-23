/**
 * 描述通知及其来源
 * @module
 */
import fetch from "node-fetch"
import { JSDOM } from 'jsdom'
import chalk from "chalk"

import { parse_date } from '../util/my_date.js'
import { SourceRaw, SourceInterface, NoticeRaw, NoticeInterface } from "./interfaces.js"



/**
 * 通知来源
 */
export class Source implements SourceInterface {
    name: string
    full_name: string
    alt_name: string[]
    url: string
    guide: string[]

    /**
     * 
     * @param raw 
     */
    constructor({
        name, full_name = '', alt_name = [],
        url, guide = [],
    }: SourceRaw) {
        this.name = name
        this.full_name = full_name || name
        this.alt_name = alt_name
        this.url = url
        this.guide = guide
    }

    async fetch_notice() {
        console.error(chalk.red('✗ 这个源不支持获取通知。'))
        return [] as Notice[]
    }
}


export interface SourceBySelectorsRaw extends SourceRaw {
    selectors: {
        rows: string,
        link?: string, title?: string,
        date?: string
    }
}

/**
 * 基于选择器的通知来源
 * 
 * 先获取静态网页，然后用CSS选择器从中提取信息。
 */
export class SourceBySelectors extends Source {
    selectors: {
        rows: string,
        link: string,
        title: string,
        date: string
    }

    constructor(raw: SourceBySelectorsRaw) {
        super(raw)

        const {
            rows,
            link = 'a', title = '',
            date = 'span'
        } = raw.selectors

        this.selectors = { rows, link, date, title: title || link }
    }

    private _row_to_notice(row: Element) {
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



/**
 * 通知
 */
export class Notice implements NoticeInterface {
    link: string
    title: string
    date: Date | null
    source: Source

    /**
     * 
     * @param raw 
     * @param options 选项
     * @param options.sources_set 可能的通知来源（如果`raw`的`source`是`string`，会从中搜索）
     */
    constructor({ link, title, date, source }: NoticeRaw,
        { sources_set }: { sources_set?: SourceInterface[] } = {}) {
        this.link = link
        this.title = title
        this.date = date

        if (source instanceof Source) {
            this.source = source
        } else if (typeof source === 'string') {
            if (sources_set) {
                this.source = sources_set.find(s => s.name === source)
                if (!this.source) {
                    console.log(chalk.yellow(`⚠ 未知的来源：${source}。将忽略。`))
                }
            }
            if (!this.source) {
                this.source = new Source({ name: source, url: '' })
            }
        }
        console.assert(this.source, chalk.red(`✗ 未能识别来源${source}。将忽略，但可能引起其它错误。`))
    }

    get source_name() {
        return this.source.name
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

/**
 * 基于选择器的通知来源
 *
 * 先获取静态网页，然后用CSS选择器从中提取信息。
 *
 * @module
 */

import { readFile } from 'fs/promises'
import { JSDOM } from 'jsdom'
import { parse_date } from '../../util/my_date.js'
import fetch from '../fetch_wrapper.js'
import type { HookCollectionType } from '../hooks_type.js'
import { Notice, Source, type SourceInterface } from '../models.js'

interface SourceBySelectorsInterface extends SourceInterface {
    selectors: {
        rows: string,
        link?: string, title?: string,
        date?: string
    }
}

class SourceBySelectors extends Source {
    selectors: {
        rows: string,
        link: string,
        title: string,
        date: string
    }

    constructor (raw: SourceBySelectorsInterface) {
        super(raw)

        const {
            rows,
            link = 'a', title = '',
            date = 'span',
        } = raw.selectors

        this.selectors = { rows, link, date, title: title || link }
    }

    private _row_to_notice (row: Element) {
        const link: HTMLAnchorElement = row.querySelector(this.selectors.link)
        const title = row.querySelector(this.selectors.title)
        const date = this.selectors.date ? row.querySelector(this.selectors.date) : null

        return new Notice({
            link: (new URL(link.href, this.url)).href,
            title: title.textContent.trim(),
            date: date ? parse_date(date.textContent) : null,
            source: this,
        })
    }

    async fetch_notice ({ _hook }: { _hook: HookCollectionType }) {
        const html = await (await fetch({ url: this.url, _hook })).text()
        const dom = new JSDOM(html)

        const rows = dom.window.document.querySelectorAll(this.selectors.rows)

        return Array.from(rows).map(row => this._row_to_notice(row))
    }
}

export default async function import_sources_by_selectors ({ path }: { path: string }): Promise<Source[]> {
    const file = await readFile(path)

    const raw_sources: SourceBySelectorsInterface[] =
        JSON.parse(file.toString()).sources

    return raw_sources.map(s => new SourceBySelectors(s))
}

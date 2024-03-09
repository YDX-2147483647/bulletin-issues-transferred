/**
 * 基于选择器的通知来源
 *
 * 先获取静态网页，然后用CSS选择器从中提取信息。
 *
 * @module
 */

import {
    DOMParser,
    type Element,
} from 'https://deno.land/x/deno_dom@v0.1.42/deno-dom-wasm.ts'
import { parse_date } from '../../util/my_date.ts'
import hooked_fetch from '../fetch_wrapper.ts'
import type { HookCollectionType } from '../hooks_type.ts'
import { Notice, Source, type SourceInterface } from '../models.ts'

interface SourceBySelectorsInterface extends SourceInterface {
    selectors: {
        rows: string
        link?: string
        title?: string
        date?: string
    }
}

class SourceBySelectors extends Source {
    selectors: {
        rows: string
        link: string
        title: string
        date: string
    }

    constructor(raw: SourceBySelectorsInterface) {
        super(raw)

        const {
            rows,
            link = 'a',
            title = '',
            date = 'span',
        } = raw.selectors

        this.selectors = { rows, link, date, title: title || link }
    }

    /**
     * @param base_url 页面的 URL（插件可以让实际页面的 URL 与`this.url`不同）
     */
    private _row_to_notice(row: Element, base_url: string) {
        const link = row.querySelector(this.selectors.link) as Element
        const title = row.querySelector(this.selectors.title) as Element
        const date = this.selectors.date
            ? row.querySelector(this.selectors.date)
            : null

        return new Notice({
            link: (new URL(link.getAttribute('href') as string, base_url)).href,
            title: title.textContent.trim(),
            date: date ? parse_date(date.textContent) : null,
            source: this,
        })
    }

    async fetch_notice(
        { _hook }: { _hook: HookCollectionType },
    ): Promise<Notice[]> {
        const response = await hooked_fetch({ url: this.url, _hook })
        const html = await response.text()
        const document = new DOMParser().parseFromString(html, 'text/html')

        const rows = document?.querySelectorAll(this.selectors.rows) ?? []

        return Array.from(rows).map((row) =>
            this._row_to_notice(row as Element, response.url)
        )
    }
}

export default async function import_sources_by_selectors(
    { path }: { path: string },
): Promise<Source[]> {
    const file = await Deno.readTextFile(path)

    const raw_sources: SourceBySelectorsInterface[] =
        JSON.parse(file.toString()).sources

    return raw_sources.map((s) => new SourceBySelectors(s))
}

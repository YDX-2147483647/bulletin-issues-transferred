/**
 * 数据模型
 * @module
 */

/**
 * 通知来源，可用作构造{@link Source}的参数
 * @see `sources.schema.json`
 */
export interface SourceInterface {
    name: string
    full_name?: string
    alt_name?: string[]

    url: string
    guide?: string[],
}

/**
 * 通知来源
 */
export class Source {
    id: string

    name: string
    full_name: string
    alt_name: string[]

    url: string
    guide: string[]

    constructor ({ name, full_name, alt_name = [], url, guide = [] }: SourceInterface) {
        this.name = name
        this.full_name = full_name ?? name
        this.alt_name = alt_name
        this.url = url
        this.guide = guide

        this.id = this.name
    }

    /**
     * 抓取通知
     */
    async fetch_notice (): Promise<Notice[]> {
        throw new Error('Not implemented.')
    }
}

/**
 * 通知，可用作构造{@link Notice}的参数
 */
export interface NoticeInterface {
    link: string
    title: string
    date: Date | null

    /** 通知来源或 id */
    source: Source | string
}

/**
 * 通知
 */
export class Notice {
    id: string

    link: string
    title: string
    date: Date | null

    source?: Source
    #source_ref: Source | string

    constructor ({ link, title, date, source }: NoticeInterface) {
        this.link = link
        this.title = title
        this.date = date
        this.#source_ref = source

        this.id = this.link
    }

    populate ({ sources }: { sources?: Source[] }) {
        if (sources !== undefined) {
            if (this.#source_ref instanceof Source) {
                this.source = this.#source_ref
            } else {
                this.source = sources.find(s => s.id === this.#source_ref)
                if (this.source === undefined) {
                    throw new Error(`找不到来源：${this.#source_ref}。`)
                }
            }
        }
    }

    get source_name () {
        if (this.source !== undefined) {
            return this.source.name
        } else if (this.#source_ref instanceof Source) {
            return this.#source_ref.name
        } else {
            return this.#source_ref
        }
    }

    get source_id () {
        if (this.source !== undefined) {
            return this.source.id
        } else if (this.#source_ref instanceof Source) {
            return this.#source_ref.id
        } else {
            return this.#source_ref
        }
    }

    /** @todo 应当是 plugin */
    to_human_readable_rows () {
        return [
            `${this.source_name}｜${this.title}`,
            this.link,
            this.date ? this.date.toLocaleString() : '（未知日期）',
        ]
    }

    /** @todo 应当是 plugin */
    to_markdown (): string {
        return [
            `${this.source_name}：[${this.title}](${this.link})`,
            this.date ? `（${this.date.toLocaleString()}）` : '',
        ].join('')
    }

    to_raw () {
        return {
            link: this.link,
            title: this.title,
            date: this.date,
            source: this.source_id,
        } as NoticeInterface
    }

    valueOf () {
        return this.to_raw()
    }
}

/**
 * 通知、来源的接口
 * @module
 */

/**
 * 通知来源（接口）
 * @see `sources.schema.json`
 */
export interface SourceInterface {
    name: string
    full_name: string
    alt_name: string[]
    url: string
    guide: string[]

    /**
     * 抓取通知
     */
    fetch_notice(): Promise<NoticeInterface[]>
}

/**
 * 通知来源（简易格式），可用作构造{@link Source}的参数
 * @see `sources.schema.json`
 */
export interface SourceRaw {
    name: string, full_name?: string, alt_name?: string[],
    url: string, guide?: string[],
}

/**
 * 通知来源的存储格式，基本等同于JSON文件
 * @see `sources.schema.json`
 */
export interface SourceStorageFormat extends SourceRaw {
    fetch_by: string,
    selectors?: any
}



/**
 * 通知（接口）
 */
export interface NoticeInterface {
    link: string
    title: string
    date: Date | null
    source: SourceInterface
    source_name: string

    /** 转换成容易存储的`NoticeRaw`（其`source`为`string`） */
    to_raw(): NoticeRaw
    /** 等同于{@link to_raw} */
    valueOf(): NoticeRaw

    /**
     * 转换为对人友好的格式
     * 
     * 第一行是来源和标题，第二行是链接，第三行是日期。
     */
    to_human_readable_rows(): string[]

    to_markdown(): string
}

/**
 * 通知（简易格式），可用作构造{@link Notice}的参数
 * 
 * `source`既允许{@link Source}，也允许`string`。
 */
export interface NoticeRaw {
    link: string
    title: string
    date: Date | null
    source?: SourceInterface | string
}

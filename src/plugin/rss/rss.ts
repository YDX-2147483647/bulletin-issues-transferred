import { writeFile } from 'fs/promises'
import xml from 'xml'
import type { Notice } from '../../core/index.js'
import { logger } from '../../util/logger.js'
import { sort_by_date, format_date } from '../../util/my_date.js'

/**
 * @param notice 需要 source，因此请提前{@link Notice.populate}
 */
function to_feed_item (notice: Notice) {
    let description: string
    if (notice.source.url) {
        description = `来自<a href='${notice.source.url}' title='${notice.source.full_name}'>${notice.source_name}</a>。`
    } else if (notice.source) {
        description = `来自${notice.source_name}。`
    } else {
        description = '未知来源。'
    }

    return {
        item: [
            { title: notice.title },
            { pubDate: notice.date ? format_date(notice.date) : null },
            { link: notice.link },
            {
                guid: [
                    { _attr: { isPermaLink: true } },
                    notice.link,
                ],
            },
            { description: { _cdata: description } },
            { category: notice.source_name ?? '未知来源' },
        ],
    }
}

/**
 * 将一系列通知转换为RSS
 * @param notices 需要 source，因此请提前{@link Notice.populate}
 * @param options @see `config.schema.json`中的`rss`
 */
export function build_feed (notices: Notice[], options: {
    rss_href: string, title: string, link: string, description: string
}) {
    const feed_obj = {
        rss: [
            {
                _attr: {
                    version: '2.0',
                    'xmlns:atom': 'http://www.w3.org/2005/Atom',
                },
            },
            {
                channel: [
                    {
                        'atom:link': {
                            _attr: {
                                href: options.rss_href,
                                rel: 'self',
                                type: 'application/rss+xml',
                            },
                        },
                    },
                    {
                        'atom:link': {
                            _attr: {
                                href: options.link,
                                rel: 'alternate',
                                type: 'text/html',
                            },
                        },
                    },
                    { title: options.title },
                    { link: options.link },
                    { description: options.description },
                    { language: 'zh-CN' },
                    { generator: 'Bulletin Issues Transferred' },
                    { lastBuildDate: format_date(new Date()) },
                    ...notices.map(to_feed_item),
                ],
            },
        ],
    }

    return '<?xml version="1.0" encoding="UTF-8"?>' + xml(feed_obj)
}

/**
 * 用通知生成RSS，然后写入`path`
 * @param notices 需要 source，因此请提前{@link Notice.populate}
 * @param options
 */
export async function write_rss (notices: Notice[], path: string, options: {
    rss_href: string; title: string; link: string; description: string, max_items: number
}) {
    const { max_items, ...rss_options } = options

    notices.sort(sort_by_date)
    await writeFile(path, build_feed(notices.slice(0, max_items), rss_options))
    logger.info(`已保存到“${path}”。`, { plugin: 'rss' })
}

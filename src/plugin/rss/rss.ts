import chalk from 'chalk'
import { writeFile } from 'fs/promises'
import xml from 'xml'
import type { Notice } from '../../core/index.js'

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
            { pubDate: notice.date ? notice.date.toUTCString() : null },
            { link: notice.link },
            {
                guid: [
                    { _attr: { isPermaLink: true } },
                    notice.link,
                ],
            },
            { description: { _cdata: description } },
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
                    { title: options.title },
                    { link: options.link },
                    { description: options.description },
                    { language: 'zh-CN' },
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
    rss_href: string; title: string; link: string; description: string
}) {
    await writeFile(path, build_feed(notices, options))
    console.log(chalk.green('✓'), `已保存到“${path}”。`)
}

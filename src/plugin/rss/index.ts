/**
 * 简易RSS
 * （源代码中有`config`）
 * @module
 */
import xml from 'xml'
import chalk from 'chalk'
import { writeFile } from 'fs/promises'

import { NoticeInterface } from "../../core/interfaces.js"

const some_mysterious_website = ''

const config = {
    link: `${some_mysterious_website}/`,
    description: 'Bulletin Issues Transferred',
    rss_file: `${some_mysterious_website}/feed.rss`,
    title: 'BulletinIT'
}


function to_feed_item(notice: NoticeInterface) {
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
                    notice.link
                ]
            },
            { description: { _cdata: description } }
        ]
    }
}

/**
 * 将一系列通知转换为RSS
 */
export function build_feed(notices: NoticeInterface[]) {
    const feed_obj = {
        rss: [
            {
                _attr: {
                    version: "2.0",
                    "xmlns:atom": "http://www.w3.org/2005/Atom",
                },
            },
            {
                channel: [
                    {
                        "atom:link": {
                            _attr: {
                                href: config.rss_file,
                                rel: "self",
                                type: "application/rss+xml",
                            },
                        },
                    },
                    { title: config.title, },
                    { link: config.link, },
                    { description: config.description },
                    { language: "zh-CN" },
                    ...notices.map(to_feed_item),
                ]
            },
        ]
    }

    return '<?xml version="1.0" encoding="UTF-8"?>' + xml(feed_obj)
}

/**
 * 用通知生成RSS，然后写入`data/feed.rss`
 * @param notices 
 */
export async function write_rss(notices: NoticeInterface[]) {
    await writeFile('data/feed.rss', build_feed(notices))
    console.log(chalk.green('✓'), '已保存到 data/feed.rss')
}

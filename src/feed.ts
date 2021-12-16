import { Notice, Source } from "./notice.js"
import xml from 'xml'

const some_mysterious_website = ''

const config = {
    link: `${some_mysterious_website}/`,
    description: 'Bulletin Issues Transferred',
    rss_file: `${some_mysterious_website}/feed.rss`,
    title: 'BulletinIT'
}


function to_feed_item(notice: Notice) {
    let description: string
    if (notice.source instanceof Source) {
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

export function build_feed(notices: Notice[]) {
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

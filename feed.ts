import { Notice } from "./notice.js"
import xml from 'xml'

const some_mysterious_website = ''

const config = {
    link: `${some_mysterious_website}/`,
    description: 'Highly Accessible Origin for Breaking Informative Things',
    rss_file: `${some_mysterious_website}/feed.rss`,
    title: 'HaoBit'
}


function to_feed_item(notice: Notice) {
    return {
        item: [
            { title: notice.title },
            { pubDate: notice.date.toUTCString() },
            {
                guid: [
                    { _attr: { isPermaLink: true } },
                    notice.link
                ]
            },
            {
                description: {
                    _cdata:
                        notice.source
                            ? `来自<a href='${notice.source.url}' title='${notice.source.full_name}'>${notice.source.name}</a>。`
                            : '未知来源。'
                }
            }
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

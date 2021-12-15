import chalk from "chalk"

import { fetch_all_sources, Notice } from './notice.js'
import { import_sources, read_json, write_json, write_rss } from './notices_saver.js'




/**
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 */
function sort_by_date(a: Notice, b: Notice) {
    if (a.date === null) {
        return 1
    }
    if (b.date === null) {
        return -1
    }
    return b.date.getTime() - a.date.getTime()
}


async function get_notices_and_filter_out_the_recent() {
    const today = new Date()
    const ninety_days_ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90)

    const notices = (await fetch_all_sources(await import_sources(), { verbose: true }))
        .filter(n => n.date === null || n.date.getTime() >= ninety_days_ago.getTime())
        .sort(sort_by_date)

    console.log(`共筛选出${notices.length}条90天内的通知。`)

    return notices
}

async function diff(notices: Notice[]) {
    const existed_links = (await read_json({ ignore_source: true })).map(n => n.link)
    return notices.filter(n => !existed_links.includes(n.link))
}

function notices_to_human_readable(notices: Notice[]) {
    return notices.map((notice, index) => [
        chalk.underline(String(index + 1).padStart(2, ' ')) +
        `  ${notice.source.name}｜${notice.title}`,
        `    ${notice.link}`,
        `    ${notice.date ? notice.date.toLocaleString() : '（未知日期）'}`
    ].join('\n')).join('\n\n')
}




const notices = await get_notices_and_filter_out_the_recent()
const new_notices = await diff(notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')

    console.log(notices_to_human_readable(
        (await read_json()).slice(0, 5)
    ))
    console.log('以上是最新的5项通知。')

} else {
    console.log(`发现${new_notices.length}项新通知。`)

    new_notices.forEach(n => {
        if (!n.date) {
            n.date = new Date()
        }
    })
    notices.sort(sort_by_date)

    console.log(notices_to_human_readable(new_notices))

    write_json(notices)
    write_rss(notices)
}

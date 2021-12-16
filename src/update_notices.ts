import chalk from "chalk"

import { fetch_all_sources, NoticeInterface, NoticeRaw, Notice } from './notice.js'
import { import_sources, read_json, write_json, write_rss } from './notices_saver.js'




/**
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 */
function sort_by_date(a: NoticeRaw | NoticeInterface, b: NoticeRaw | NoticeInterface) {
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


function print_notices(notices: Notice[], { max = 5, remark_if_overflow = true } = {}) {
    console.log(
        notices.slice(0, max)
            .map((notice, index) => {
                const rows = notice.to_human_readable_rows()
                return [
                    chalk.underline(String(index + 1).padStart(2, ' ')) + `  ${rows[0]}`,
                    ...rows.slice(1).map(row => `    ${row}`)
                ].join('\n')
            })
            .join('\n\n')
    )

    if (remark_if_overflow && notices.length > max) {
        console.log('\n' + chalk.underline('……') +
            `  另外还有${notices.length - max}项通知未显示。`)
    }
}



const notices = await get_notices_and_filter_out_the_recent()
const new_notices = await diff(notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')

    print_notices(
        await read_json({ ignore_source: false }),
        { max: 5, remark_if_overflow: false }
    )
    console.log('以上是最新的5项通知。')

} else {
    console.log(`发现${new_notices.length}项新通知。`)

    new_notices.forEach(n => {
        if (!n.date) {
            n.date = new Date()
        }
    })
    notices.sort(sort_by_date)

    print_notices(new_notices)

    write_json(notices)
    write_rss(notices)
}

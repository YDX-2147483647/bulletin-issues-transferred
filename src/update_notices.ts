/**
 * 获取通知并更新文件
 * @module
 */
import { sort_by_date, diff, print_notices, fetch_all_sources, merge } from "./notices_util.js"
import { read_json, write_json, write_rss } from './notices_saver.js'
import { import_sources } from "./sources_importer.js"



const latest_notices = await fetch_all_sources(await import_sources(),
    { verbose: true, days_ago: 90, sort: true })
const existed_notices = await read_json({ ignore_source: true })
const new_notices = diff(existed_notices, latest_notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')

    print_notices(existed_notices,
        { max: 5, remark_if_overflow: false })
    console.log('以上是最新的5项通知。')

} else {
    console.log(`发现${new_notices.length}项新通知。`)

    new_notices.forEach(n => {
        if (!n.date) {
            n.date = new Date()
        }
    })
    new_notices.sort(sort_by_date)
    print_notices(new_notices, { max: 20 })

    const saved_notices = merge(existed_notices, new_notices,
        { verbose: true, days_ago: 90, sort: true })
    write_json(saved_notices)
    write_rss(saved_notices)
}

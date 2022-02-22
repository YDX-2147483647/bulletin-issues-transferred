/**
 * 获取通知并更新文件
 * @module
 */

import { read_json, write_json } from './core/notices_saver.js'
import import_sources from "./core/sources/index.js"
import { diff, merge } from "./util/notices.js"
import { sort_by_date } from "./util/my_date.js"
import { print_notices, fetch_all_sources } from "./plugin/cli/index.js"



const sources = await import_sources()
const latest_notices = await fetch_all_sources(sources,
    { verbose: true, days_ago: 90, sort: true })
const existed_notices = await read_json()
const new_notices = diff(existed_notices, latest_notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')

    print_notices(existed_notices,
        { max: 3, remark_if_overflow: false })
    console.log('以上是最新的3项通知。')

} else {
    console.log(`发现${new_notices.length}项新通知。`)

    new_notices.forEach(n => {
        if (!n.date) {
            n.date = new Date()
        }
    })
    new_notices.sort(sort_by_date)
    print_notices(new_notices, { max: 20 })

    const { notices: saved_notices, change } =
        merge(existed_notices, new_notices,
            { days_ago: 90, sort: true })
    console.log(`新增 ${change.add} 项，过期 ${change.drop} 项。`)
    write_json(saved_notices)
}

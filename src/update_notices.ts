import { sort_by_date, diff, print_notices, fetch_all_sources } from "./notices_util.js"
import { import_sources_by_selectors, read_json, write_json, write_rss } from './notices_saver.js'



const notices = await fetch_all_sources(await import_sources_by_selectors(),
    { verbose: true, days_ago: 90, sort: true })
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

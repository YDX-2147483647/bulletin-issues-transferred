/**
 * 获取通知并更新文件
 * @module
 */

import { read_json, write_json } from './core/notices_saver.js'
import import_sources from './core/sources/index.js'
import { diff, merge } from './util/notices.js'
import { sort_by_date } from './util/my_date.js'
import { fetch_all_sources } from './plugin/cli/index.js'

export async function update_notices () {
    const sources = await import_sources()
    const latest_notices = await fetch_all_sources(sources,
        { verbose: true, days_ago: 90, sort: true })

    const existed_notices = await read_json()

    const new_notices = diff(existed_notices, latest_notices)
    new_notices.forEach(n => {
        if (!n.date) {
            n.date = new Date()
        }
    })
    new_notices.sort(sort_by_date)

    const { notices: notices_to_save, change } = merge(
        existed_notices, new_notices,
        { days_ago: 90, sort: true },
    )

    if (change.add) {
        write_json(notices_to_save)
        return {
            all_notices: existed_notices,
            new_notices,
            change,
        }
    } else {
        return {
            all_notices: notices_to_save,
            new_notices,
            change: { add: 0, drop: 0 },
        }
    }
}

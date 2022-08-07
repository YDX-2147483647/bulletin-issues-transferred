/**
 * 获取通知并更新文件
 * @module
 */

import { sort_by_date } from '../util/my_date.js'
import type { HookCollectionType } from './hooks_type.js'
import type { Notice } from './models.js'
import { diff, fetch_all_sources, merge, read_json, write_json } from './notices/index.js'
import import_sources from './sources/index.js'

async function _update_notices ({ _hook, ...options }: { _hook: HookCollectionType }) {
    const sources = await import_sources()
    const { notices: latest_notices } = await fetch_all_sources({
        sources,
        _hook,
        ...options,
    })

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

/**
 *
 * @param options
 * @param options._hook (internal usage only) `update`
 * @returns
 */
export function update_notices ({ _hook }: { _hook: HookCollectionType }): Promise<{
    all_notices: Notice[]
    new_notices: Notice[]
    change: {
        add: number
        drop: number
    }
}> {
    return _hook('update', _update_notices, { _hook })
}

/**
 * 获取通知并更新文件
 * @module
 */

import { sort_by_date } from '../util/my_date.js'
import type { HookCollectionType } from './hooks_type.js'
import type { Notice } from './models.js'
import { diff, fetch_all_sources, merge, read_json, write_json } from './notices/index.js'
import import_sources from './sources/index.js'

type UpdateNoticesOptions = {
    read_json_path: string,
    write_json_path: string
    sources_by_selectors_path: string
}

async function _update_notices ({
    sources_by_selectors_path, read_json_path, write_json_path,
    _hook, ...options
}: { _hook: HookCollectionType } & UpdateNoticesOptions) {
    const sources = await import_sources({ sources_by_selectors_path })
    const { notices: latest_notices } = await fetch_all_sources({
        sources,
        _hook,
        ...options,
    })

    const existed_notices = await read_json({ path: read_json_path })

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
        write_json(notices_to_save, { path: write_json_path })
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
 * @param options.read_json_path 上次结果的文件路径
 * @param options.write_json_path 用于保存这次结果的文件路径
 * @param options.sources_by_selectors_path `sources_by_selectors.json`
 * @param options._hook (internal usage only) `update`
 * @returns
 */
export function update_notices (options: { _hook: HookCollectionType } & UpdateNoticesOptions): Promise<{
    all_notices: Notice[]
    new_notices: Notice[]
    change: {
        add: number
        drop: number
    }
}> {
    return options._hook('update', _update_notices, options)
}

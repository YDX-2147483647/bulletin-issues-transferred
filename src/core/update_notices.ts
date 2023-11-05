/**
 * 获取通知并更新文件
 * @module
 */

import type { HookCollectionType } from './hooks_type.ts'
import type { Notice } from './models.ts'
import { fetch_all_sources, merge, read_json, write_json } from './notices/index.ts'
import import_sources from './sources/index.ts'

type UpdateNoticesOptions = {
    read_json_path: string,
    write_json_path: string
    sources_by_selectors_path: string
    save_for: number
}

async function _update_notices ({
    sources_by_selectors_path, read_json_path, write_json_path, save_for,
    _hook, ...options
}: { _hook: HookCollectionType } & UpdateNoticesOptions) {
    const sources = await import_sources({ sources_by_selectors_path })
    const { notices: latest_notices } = await fetch_all_sources({
        sources,
        _hook,
        ...options,
    })

    // 规范日期
    //
    // - 有些来源未给出日期，之后无法排序。
    // - 有些来源的日期在未来，这存在兼容性问题（implausible date）。
    //
    // 这两种情况都设置为当前日期。
    const now = new Date()
    latest_notices.forEach(n => {
        if (!n.date || n.date > now) {
            n.date = new Date()
        }
    })

    const existed_notices = await read_json({ path: read_json_path })
    const { notices: notices_to_save, new_notices, change } = merge(
        existed_notices, latest_notices,
        { days_ago: save_for, sort: true },
    )

    if (change.add) {
        await write_json(notices_to_save, { path: write_json_path })
        return {
            all_notices: notices_to_save,
            new_notices,
            change,
        }
    } else {
        return {
            all_notices: existed_notices,
            new_notices,
            change: { add: 0, drop: 0 },
        }
    }
}

/**
 * 检查是否有新通知，有则更新（留同加异去旧），无则不更新
 *
 * @param options
 * @param options.read_json_path 上次结果的文件路径
 * @param options.write_json_path 用于保存这次结果的文件路径
 * @param options.sources_by_selectors_path `sources_by_selectors.json`
 * @param options.save_for 保存天数，0表示永远保存
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

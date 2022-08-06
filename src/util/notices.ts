/**
 * 通知的一些常用操作
 * @module
 */

import { Notice } from '../core/models.js'
import { sort_by_date, recent_checker } from './my_date.js'

/**
 * 筛选出新通知
 * @param original 已有通知，不会被修改
 * @param latest 新通知
 */
export function diff (original: Notice[], latest: Notice[]) {
    const original_ids = original.map(n => n.id)
    return latest.filter(n => !original_ids.includes(n.id))
}

/**
 * 将新通知合并进已有通知（留同加异去旧）
 * @param original 已有通知，不会被修改
 * @param latest 新通知
 * @param options 选项
 * @param options.days_ago 筛选多少天内的通知，0表示不筛选。
 * @param options.sort 合并后是否按日期降序排列。
 */
export function merge (original: Notice[], latest: Notice[],
    { days_ago = 0, sort = true } = {}) {
    const difference = diff(original, latest)
    const all = original.concat(difference)

    const is_recent = recent_checker(days_ago)
    const recent = all.filter(n => is_recent(n.date))

    const final = sort ? recent.sort(sort_by_date) : recent
    return {
        notices: final,
        change: {
            add: difference.length,
            drop: all.length - recent.length,
        },
    }
}

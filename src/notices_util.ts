/**
 * 通知的一些常用操作
 * @module
 */
import chalk from 'chalk'
import cliProgress from "cli-progress"
import { FetchError } from 'node-fetch'

import { Notice, Source } from './core/models.js'



/**
 * 按日期降序排列
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 * @example
 * ```
 * const notices = [notice_1, notice_2, ...]
 * notices.sort(sort_by_date)
 * ```
 */
export function sort_by_date(a:Notice, b:Notice) {
    if (a.date === null) {
        return 1
    }
    if (b.date === null) {
        return -1
    }
    return b.date.getTime() - a.date.getTime()
}

/**
 * 检验日期是否是最近
 * @param days_ago 多少天内算最近，0表示都算。
 */
function recent_checker(days_ago: number) {
    if (days_ago === 0) {
        return (date: Date | null) => true
    }

    const today = new Date()
    const ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days_ago)
    return (date: Date | null) => date === null || date.getTime() >= ago.getTime()
}



/**
 * 从一系列来源获取通知
 * @param sources 
 * @param options 选项
 * @param options.verbose 是否输出信息。
 * @param options.days_ago 筛选多少天内的通知，0表示不筛选。
 * @param options.sort 是否按日期降序排列。
 * @todo Hook needed
 */
export async function fetch_all_sources(sources: Source[],
    { verbose = true, days_ago = 0, sort = true } = {}) {

    let bar: cliProgress.SingleBar
    if (verbose) {
        console.log(chalk.green('🛈'), `发现${sources.length}个通知来源。`)

        bar = new cliProgress.SingleBar({
            format: '抓取通知 {bar} {percentage}% | {value}/{total} | 已用{duration_formatted}，预计还需{eta_formatted}'
        }, cliProgress.Presets.shades_classic)
        bar.start(sources.length, 0)
    }

    const is_recent = recent_checker(days_ago)

    const notices_grouped = await Promise.all(sources.map(async s => {
        try {
            const notices = await s.fetch_notice()
            if (notices.length === 0) {
                console.log(chalk.yellow(`⚠ 未从“${s.name}”获取到任何通知。将忽略。`))
            }
            if (verbose) {
                bar.increment()
            }

            return notices.filter(n => is_recent(n.date))

        } catch (error) {
            if (error instanceof FetchError && error.errno === 'ENOTFOUND') {
                if (verbose) {
                    bar.increment()
                }
                console.error(chalk.red(`✗ 未能访问“${s.name}”（ENOTFOUND）。将忽略。`))
                return []
            } else {
                throw error
            }
        }
    }))
    if (verbose) {
        bar.stop()
    }

    const all_notices = notices_grouped.flat()
    if (verbose) {
        console.log(`共筛选出${all_notices.length}项通知。`)
    }

    if (sort) {
        return all_notices.sort(sort_by_date)
    } else {
        return all_notices
    }
}


/**
 * 筛选出新通知
 * @param original 已有通知，不会被修改
 * @param latest 新通知
 */
export function diff(original: Notice[], latest: Notice[]) {
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
export function merge(original: Notice[], latest: Notice[],
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
            drop: all.length - recent.length
        }
    }
}


/**
 * 打印一系列通知
 * @param notices 
 * @param options 选项
 * @param options.max 打印出来的通知的最大数量，0 表示无限制。
 * @param options.remark_if_overflow 通知太多而未全部打印时是否提示。
 */
export function print_notices(notices: Notice[], { max = 5, remark_if_overflow = true } = {}) {
    console.log(
        notices.slice(0, max || undefined)
            .map((notice, index) => {
                const rows = notice.to_human_readable_rows()
                return [
                    chalk.underline(String(index + 1).padStart(2, ' ')) + `  ${rows[0]}`,
                    ...rows.slice(1).map(row => `    ${row}`)
                ].join('\n')
            })
            .join('\n\n')
    )

    if (max !== 0 && remark_if_overflow && notices.length > max) {
        console.log('\n' + chalk.underline('……') +
            `  另外还有${notices.length - max}项通知未显示。`)
    }
}

import chalk from 'chalk'

import { SourceInterface, NoticeRaw, NoticeInterface } from "./notice.js"
import { read_json } from './notices_saver.js'



/**
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 */
export function sort_by_date(a: NoticeRaw | NoticeInterface, b: NoticeRaw | NoticeInterface) {
    if (a.date === null) {
        return 1
    }
    if (b.date === null) {
        return -1
    }
    return b.date.getTime() - a.date.getTime()
}


/**
 * 
 * @param sources 
 * @param option verbose：是否输出信息。days_ago：筛选多少天内的通知，0表示不筛选。sort：是否按日期降序排列。
 * @returns 
 */
export async function fetch_all_sources(sources: SourceInterface[],
    { verbose = true, days_ago = 0, sort = true } = {}) {
    if (verbose) {
        console.log(chalk.green('🛈'), `发现${sources.length}个通知来源。`)
    }

    const notices_grouped = await Promise.all(sources.map(async s => {
        const notices = await s.fetch_notice()
        if (notices.length === 0) {
            console.log(chalk.yellow(`⚠ 未从“${s.name}”获取到任何通知。将忽略。`))
        } else if (verbose) {
            console.log(chalk.green('🛈'), `从“${s.name}”获取到${notices.length}项通知。`)
        }

        if (days_ago) {
            const today = new Date()
            const ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days_ago)
            return notices.filter(n => n.date === null || n.date.getTime() >= ago.getTime())
        } else {
            return notices
        }
    }))

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


export async function diff(notices: NoticeInterface[]) {
    const existed_links = (await read_json({ ignore_source: true })).map(n => n.link)
    return notices.filter(n => !existed_links.includes(n.link))
}

export function print_notices(notices: NoticeInterface[], { max = 5, remark_if_overflow = true } = {}) {
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

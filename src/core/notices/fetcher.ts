import chalk from 'chalk'
import cliProgress from 'cli-progress'
import { FetchError } from 'node-fetch'
import { Source } from '../models.js'
import { sort_by_date, recent_checker } from '../../util/my_date.js'

/**
 * 从一系列来源获取通知
 * @param sources
 * @param options 选项
 * @param options.verbose 是否输出信息。
 * @param options.days_ago 筛选多少天内的通知，0表示不筛选。
 * @param options.sort 是否按日期降序排列。
 * @todo Hook needed
 */

export async function fetch_all_sources (sources: Source[],
    { verbose = true, days_ago = 0, sort = true } = {}) {
    let bar: cliProgress.SingleBar
    if (verbose) {
        console.log(chalk.green('🛈'), `发现${sources.length}个通知来源。`)

        bar = new cliProgress.SingleBar({
            format: '抓取通知 {bar} {percentage}% | {value}/{total} | 已用{duration_formatted}，预计还需{eta_formatted}',
        }, cliProgress.Presets.shades_classic)
        bar.start(sources.length, 0)
    }

    const is_recent = recent_checker(days_ago)

    const notices_grouped = await Promise.all(sources.map(async (s) => {
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

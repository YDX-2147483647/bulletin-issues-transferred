import chalk from 'chalk'
import cliProgress from 'cli-progress'
import { FetchError } from 'node-fetch'
import type { HookCollectionType } from '../../core/index.js'
import { recent_checker } from '../../util/my_date.js'
import { print_notices } from './util.js'

function verbose (hook: HookCollectionType) {
    hook.before('fetch', (options) => {
        const { sources } = options
        console.log(chalk.green('🛈'), `发现${sources.length}个通知来源。`)
    })
    hook.error('fetch_each', (err, { source }) => {
        if (err instanceof FetchError && err.errno === 'ENOTFOUND') {
            console.error(chalk.red(`✗ 未能访问“${source.name}”（ENOTFOUND）。将忽略。`))
        } else {
            throw err
        }
    })
    hook.after('fetch_each', (result, { source }) => {
        if (result !== undefined && result.notices.length === 0) {
            console.log(chalk.yellow(`⚠ 未从“${source.name}”获取到任何通知。将忽略。`))
        }
    })
    hook.after('update', ({ change, all_notices, new_notices }) => {
        if (change.add === 0) {
            console.log('未发现新通知。')
            print_notices(all_notices,
                { max: 3, remark_if_overflow: false })
            console.log('以上是最新的3项通知。')
        } else {
            console.log(`发现 ${change.add} 项新通知。`)
            print_notices(new_notices, { max: 20 })
            console.log(`新增 ${change.add} 项，过期 ${change.drop} 项。`)
        }
    })
}

function progress_bar (hook: HookCollectionType) {
    hook.before('fetch', (options) => {
        const bar = new cliProgress.SingleBar({
            format: '抓取通知 {bar} {percentage}% | {value}/{total} | 已用{duration_formatted}，预计还需{eta_formatted}',
        }, cliProgress.Presets.shades_classic)

        // @ts-ignore We add the bar for other hooks
        options.bar = bar

        bar.start(options.sources.length, 0)
    })
    hook.after('fetch_each', (result, options) => {
        // @ts-ignore See the before hook
        const bar = options.bar as cliProgress.SingleBar
        bar.increment()
    })
    hook.after('fetch', (result, options) => {
        // @ts-ignore See the before hook
        const bar = options.bar as cliProgress.SingleBar
        bar.stop()
    })
}

/**
 * @param hook
 * @param days_ago 筛选多少天内的通知
 */
function recent_filter (hook: HookCollectionType, days_ago: number) {
    hook.before('fetch', (options) => {
        // @ts-ignore For other hooks
        options.is_recent = recent_checker(days_ago)
    })
    hook.after('fetch_each', (result, options) => {
        // @ts-ignore See the before hook
        const is_recent = options.is_recent
        if (result?.notices) {
            result.notices = result.notices.filter(n => is_recent(n.date))
        }
    })
}

export default {
    verbose,
    progress_bar,
    recent_filter,
}

import cliProgress from 'cli-progress'
import type { HookCollectionType } from '../../core/index.ts'
import { logger } from '../../util/logger.ts'
import { recent_checker } from '../../util/my_date.ts'
import { print_notices } from './util.ts'

export function verbose (hook: HookCollectionType) {
    hook.before('fetch', (options) => {
        const { sources } = options
        logger.info(`发现${sources.length}个通知来源。`, { plugin: 'cli' })
    })
    hook.error('fetch_each', (
        err,
        // @ts-ignore If `fetch_each` has an error hook, the after hook may get `undefined`
        { source } = { source: { name: undefined } },
    ) => {
        // todo: Catch fetch errors
        return
        if (err instanceof FetchError && err.errno === 'ENOTFOUND') {
            logger.warn(`未能访问“${source.name}”（ENOTFOUND）。将忽略。`, { plugin: 'cli' })
        } else if (err instanceof FetchError && err.errno === 'ETIMEDOUT') {
            logger.error(`访问“${source.name}”（ETIMEDOUT）超时，可能因为访问太频繁。将忽略。`, { plugin: 'cli' })
        } else if (err instanceof FetchError) {
            logger.error(err.toString(), { plugin: 'cli', hook: 'fetch_each.error' })
        } else {
            throw err
        }
    })
    hook.after('fetch_each', (result, { source }) => {
        if (result !== undefined && result.notices.length === 0) {
            logger.warn(`未从“${source.name}”获取到任何通知。将忽略。`, { plugin: 'cli' })
        }
    })
    hook.after('update', (result, { write_json_path }) => {
        logger.info(`已按需保存到“${write_json_path}”。`, { plugin: 'cli' })
    })
}

export function preview_output (hook: HookCollectionType) {
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

export function progress_bar (hook: HookCollectionType) {
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
 * 如果`days_ago`与全局设置的`save_for`一致，则这个钩子对结果无影响，只是提前了筛选步骤，并且不会阻止`core`的筛选。
 * @param hook
 * @param days_ago 筛选多少天内的通知
 */
export function recent_filter (hook: HookCollectionType, days_ago: number) {
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

/**
 * 获取通知并更新文件
 * @module
 */

import { Hook, type HookCollection } from 'before-after-hook'
import chalk from 'chalk'
import cliProgress from 'cli-progress'
import { FetchError } from 'node-fetch'
import type { Notice, Source } from './core/models.js'
import { fetch_all_sources } from './core/notices/fetcher.js'
import { read_json, write_json } from './core/notices/saver.js'
import import_sources from './core/sources/index.js'
import { recent_checker, sort_by_date } from './util/my_date.js'
import { diff, merge } from './util/notices.js'

type HooksType = {
    fetch: {
        Options: { sources: Source[] }
        Result: { notices: Notice[] }
    }
    fetch_each: {
        Options: { source: Source }
        Result: { notices: Notice[] }
        Error: Error
    }
}

const _hook = new Hook.Collection<HooksType>()

function hook_verbose (hook: HookCollection<HooksType>) {
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
}

function hook_progress_bar (hook: HookCollection<HooksType>) {
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
function hook_recent_filter (hook: HookCollection<HooksType>, days_ago: number) {
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

hook_verbose(_hook)
hook_progress_bar(_hook)
hook_recent_filter(_hook, 90)

export async function update_notices () {
    const sources = await import_sources()
    const { notices: latest_notices } = await fetch_all_sources({
        sources,
        _hook,
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

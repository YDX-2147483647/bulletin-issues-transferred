import type { HookCollection } from 'before-after-hook'
import type { Notice, Source } from '../models.js'

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

/**
 * 从一系列来源获取通知
 * @param options 选项
 * @param options.sources
 * @param options._hook (internal usage only) `fetch`, `fetch_each`
 * @param options.verbose 是否输出信息。@deprecated
 * @param options.days_ago 筛选多少天内的通知，0表示不筛选。@deprecated
 * @param options.sort 是否按日期降序排列。@deprecated
 *
 * Here there are 2 hooks: `fetch` and `fetch_each`.
 * - `fetch`: the whole process, fetching all of the sources.
 * - `fetch_each`: several parallel sub-processes, fetching each source.
 *
 * @todo Hook before `fetch`: const bar = cliProgress.SingleBar
 * @todo Hook before `fetch`: const is_recent = recent_checker(days_ago)
 * @todo Hook after `fetch_each`: bar.increment()
 * @todo Hook after `fetch_each`: `⚠ 未从“${source.name}”获取到任何通知。将忽略。`
 * @todo Hook after `fetch_each`: notices.filter(n => is_recent(n.date))
 * @todo Hook error `fetch_each`: FetchError `✗ 未能访问“${s.name}”（ENOTFOUND）。将忽略。`
 * @todo Hook after `fetch`: bar.stop()
 * @todo Hook after `fetch`: notices.sort(sort_by_date)
 */

export async function fetch_all_sources ({
    sources, _hook,
}: {
    sources: Source[],
    _hook: HookCollection<HooksType>,
    verbose?: boolean,
    days_ago?: number,
    sort?: boolean
}): Promise<{ notices: Notice[] }> {
    return await _hook(
        'fetch',
        async ({ sources }) => {
            // First create a non-hook version.
            async function fetch_each ({ source }: { source: Source }): Promise<{ notices: Notice[] }> {
                const notices = await source.fetch_notice()
                return { notices }
            }
            // Then wrap it with the hook.
            function fetch_each_hooked (s: Source): Promise<{ notices: Notice[] }> {
                return _hook('fetch_each', fetch_each, { source: s })
            }
            // Call `fetch_each` in parallel.
            const notices_grouped = await Promise.all(
                sources.map(fetch_each_hooked))

            // Ignore `undefined`.
            // (If `fetch_each` has an error hook, we may get here even though there's nothing.)
            // Flatten the result.
            // Return it.
            return {
                notices: notices_grouped
                    .map(({ notices } = { notices: [] }) => notices)
                    .flat(),
            }
        },
        { sources },
    )
}

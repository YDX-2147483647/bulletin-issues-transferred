import type { HookCollectionType } from '../hooks_type.js'
import type { Notice, Source } from '../models.js'

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
 */
export async function fetch_all_sources ({
    sources, _hook,
}: {
    sources: Source[],
    _hook: HookCollectionType,
}): Promise<{ notices: Notice[] }> {
    return await _hook(
        'fetch',
        // Why `options`? Plugins may add custom options in their before hooks.
        async ({ sources, ...options }) => {
            // First create a non-hook version.
            async function fetch_each ({ source }: { source: Source }): Promise<{ notices: Notice[] }> {
                const notices = await source.fetch_notice()
                return { notices }
            }
            // Then wrap it with the hook.
            function fetch_each_hooked (s: Source): Promise<{ notices: Notice[] }> {
                return _hook('fetch_each', fetch_each, { source: s, ...options })
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

import pMap from 'p-map'

import type { HookCollectionType } from '../hooks_type.js'
import type { Notice, Source } from '../models.js'

/**
 * 从一系列来源获取通知
 * @param options 选项
 * @param options.sources
 * @param options.concurrency
 * @param options._hook (internal usage only) `fetch`, `fetch_each`
 *
 * Here there are 2 hooks: `fetch` and `fetch_each`.
 * - `fetch`: the whole process, fetching all of the sources.
 * - `fetch_each`: several parallel sub-processes, fetching each source.
 */
export async function fetch_all_sources ({
    sources, concurrency, _hook,
}: {
    sources: Source[],
    concurrency: number,
    _hook: HookCollectionType,
}): Promise<{ notices: Notice[] }> {
    return await _hook(
        'fetch',
        // Why `options`? Plugins may add custom options in their before hooks.
        async ({ sources, ...options }) => {
            // First create a non-hook version.
            async function fetch_each ({ source }: { source: Source }): Promise<{ notices: Notice[] }> {
                const notices = await source.fetch_notice({ _hook })
                return { notices }
            }
            // Then wrap it with the hook.
            function fetch_each_hooked (s: Source): Promise<{ notices: Notice[] }> {
                return _hook('fetch_each', fetch_each, { source: s, ...options })
            }
            // Call `fetch_each` in parallel.
            const notices_grouped = await pMap(sources, fetch_each_hooked, { concurrency })

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

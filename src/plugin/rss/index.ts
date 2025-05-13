/**
 * 简易RSS
 *
 * @module
 */

import {
    config,
    type HookCollectionType,
    type Source,
} from '../../core/index.ts'
import { write_rss } from './rss.ts'

const { output_path, ...rss_options } = Object.assign(
    { max_items: 30 },
    config.rss,
) as {
    title: string
    description: string
    link: string
    rss_href: string
    output_path: string
    max_items: number
}

/**
 * `update`后保存 RSS
 *
 * 副作用：`update`的`result.all_notices`会被`populate`。
 */
export default function add_hook(hook: HookCollectionType) {
    let sources = null as Source[] | null
    hook.before('fetch', ({ sources: s }) => {
        sources = s
    })
    hook.after('update', async ({ all_notices: notices }) => {
        if (sources === null) {
            throw new Error(
                "Cannot generate RSS because there's no known source.",
            )
        }
        notices.forEach((n) => n.populate({ sources } as { sources: Source[] }))
        await write_rss(notices, output_path, rss_options)
    })
}

/**
 * 重整不完整的标题
 * @module
 */

import { type HookCollectionType } from '../../core/index.js'
import { normalize } from './normalize.js'

/**
 * `fetch_each`后重整不完整的标题
 */
export default function add_normalize_hook (hook: HookCollectionType) {
    hook.after('fetch_each', async (
        // @ts-ignore If `fetch_each` has an error hook, the after hook may get `undefined`
        { notices } = { notices: [] },
    ) => {
        notices.forEach(n => { n.title = normalize(n.title) })
    })
}

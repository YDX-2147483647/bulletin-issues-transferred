import { Hook } from 'before-after-hook'
import config from './config.js'
import type { HooksType } from './hooks_type.js'
import { update_notices as _update_notices } from './update_notices.js'

export { Notice, Source } from './models.js'
export type { NoticeInterface, SourceInterface } from './models.js'
export { config }

const _hook = new Hook.Collection<HooksType>()

export const hook = _hook.api
export type HookCollectionType = typeof hook

export function update_notices () {
    return _update_notices({
        _hook,
        read_json_path: config.json_path,
        write_json_path: config.json_path,
        sources_by_selectors_path: config.sources_by_selectors,
    })
}

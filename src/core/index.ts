import { Hook } from 'npm:before-after-hook'
import config from './config.ts'
import type { HooksType } from './hooks_type.ts'
import { update_notices as _update_notices } from './update_notices.ts'

export { Notice, Source } from './models.ts'
export type { NoticeInterface, SourceInterface } from './models.ts'
export { config }

const _hook = new Hook.Collection<HooksType>()

export const hook = _hook.api
export type HookCollectionType = typeof hook

export function update_notices() {
    return _update_notices({
        _hook,
        read_json_path: config.json_path,
        write_json_path: config.json_path,
        sources_by_selectors_path: config.sources_by_selectors,
        save_for: config.save_for,
    })
}

import { Hook } from 'before-after-hook'
import type { HooksType } from './hooks_type.js'
import { update_notices as _update_notices } from './update_notices.js'

export { Notice, Source } from './models.js'
export type { NoticeInterface, SourceInterface } from './models.js'

const _hook = new Hook.Collection<HooksType>()

export const hook = _hook.api
export type HookCollectionType = typeof hook

export function update_notices () {
    return _update_notices({ _hook })
}

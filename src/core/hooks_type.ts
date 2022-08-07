import type { HookCollection } from 'before-after-hook'
import type { Notice, Source } from './models.js'

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
    update: {
        Result: {
            all_notices: Notice[]
            new_notices: Notice[]
            change: {
                add: number
                drop: number
            }
        }
    }
}

type HookCollectionType = HookCollection<HooksType>

export type {
    HooksType,
    HookCollectionType,
}
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
}

type HookCollectionType = HookCollection<HooksType>

export type {
    HooksType,
    HookCollectionType,
}

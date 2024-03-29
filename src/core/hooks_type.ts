import type { HookCollection } from 'before-after-hook'
import type { RequestInit, Response } from 'node-fetch'
import type { Notice, Source } from './models.js'

type HooksType = {
    request: {
        Options: RequestInit & { url: string }
        Result: Response
    }
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
        Options: {
            read_json_path: string
            write_json_path: string
            sources_by_selectors_path: string
        }
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

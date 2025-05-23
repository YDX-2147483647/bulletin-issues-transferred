import type { HookCollection } from 'npm:before-after-hook'
import type { Notice, Source } from './models.ts'

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
            save_for: number
            _hook: HookCollectionType
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

export type { HookCollectionType, HooksType }

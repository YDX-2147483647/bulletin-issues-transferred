/**
 * fetch with hooks
 *
 * Inspired by [@octokit/request.js `fetch-wrapper.ts`](https://github.com/octokit/request.js/blob/master/src/fetch-wrapper.ts).
 *
 * @module
 */

import ky from 'ky'

import type { HookCollectionType } from './hooks_type.ts'

function fetch_wrapper(request: RequestInit & { url: string }) {
    const { url, ...init } = request
    return ky(url, init)
}

/**
 * @param request._hook (internal usage only) `request`
 */
export default function hooked_fetch(
    request: RequestInit & { url: string; _hook: HookCollectionType },
): Promise<Response> {
    const { _hook, ...req } = request
    return _hook('request', fetch_wrapper, req)
}

/**
 * 超时后重试
 *
 * ky 遇到超时并不会重试。
 * https://github.com/sindresorhus/ky/discussions/279#discussioncomment-187602
 * https://github.com/sindresorhus/ky/issues/546
 * @module
 */

import ky, { TimeoutError } from 'ky'
import { delay } from 'std/async/delay.ts'

import { config, type HookCollectionType } from '../../core/index.ts'
import { logger } from '../../util/logger.ts'

const retry_options = Object.assign({
    delay: 10_000,
}, config.retry) as {
    delay: number
}

/**
 * `request`出错时用 ky 重试一次
 *
 * 建议在其它`request` hook 之后调用。
 */
export default function add_retry_hook(hook: HookCollectionType) {
    hook.error('request', (error, options) => {
        if (error instanceof TimeoutError) {
            logger.http(
                `Time is out when requesting “${options.url}”. Retry later.`,
                {
                    plugin: 'retry',
                },
            )

            return delay(retry_options.delay).then(() => {
                logger.http(`Retry “${options.url}”.`, {
                    plugin: 'retry',
                })
                const { url, ...init } = options
                return ky(url, init)
            })
        } else {
            throw error
        }
    })
}

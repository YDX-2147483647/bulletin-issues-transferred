/**
 * 用 Virtual BIT Network 代理网络请求
 * @module
 */

// spell-checker: words webvpn

import { readFile } from 'fs/promises'
import { Headers } from 'node-fetch'
import VirtualBIT, { decrypt_URL, encrypt_URL } from 'virtual-bit-network'
import { parse } from 'yaml'
import { config as all_config, HookCollectionType } from '../../core/index.js'
import { logger } from '../../util/logger.js'

async function load_config ({ secrets_path, match: hostnames }: { secrets_path: string, match: string[] }) {
    const file = await readFile(secrets_path)
    const secrets = parse(file.toString()) as { username: string, password: string }
    return { secrets, hostnames }
}

// @ts-ignore
const config = await load_config(all_config.proxy)
const proxy = new VirtualBIT(config.secrets)
await proxy.sign_in()
logger.info('Signed in successfully.', { plugin: 'proxy' })

// 下面一行是玄学。有些网站（如 mec）的二级页面需要先用`proxy`访问任意网址，不然会炸。
await proxy.fetch('http://mec.bit.edu.cn')

export default function add_proxy_hook (hook: HookCollectionType) {
    hook.wrap('request', async (original_fetch, options) => {
        if (!config.hostnames.includes((new URL(options.url)).hostname)) {
            return original_fetch(options)
        }

        const { url, ...init } = options

        if (init.headers) {
            // Replace referer
            const headers = new Headers(init.headers)
            const referer = headers.get('Referer')
            if (referer && !(new URL(referer)).hostname.startsWith('webvpn.')) {
                headers.set('Referer', encrypt_URL(referer))
                init.headers = headers
            }
        }

        logger.http(`Request ${url} with proxy.`, { plugin: 'proxy' })
        return proxy.fetch(url, init)
    })

    hook.after('fetch', (result) => {
        for (const n of result.notices) {
            const url = new URL(n.link)
            if (url.hostname.startsWith('webvpn.') && url.pathname.length > 1) {
                if (n.id === n.link) {
                    n.id = n.link = decrypt_URL(n.link)
                } else {
                    n.link = decrypt_URL(n.link)
                }
            }
        }
    })
}

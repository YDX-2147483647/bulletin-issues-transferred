/**
 * 用 Virtual BIT Network 代理网络请求
 * @module
 */

// spell-checker: words webvpn

import { readFile } from 'fs/promises'
import { Headers } from 'node-fetch'
import VirtualBIT, { cli, decrypt_URL, encrypt_URL } from 'virtual-bit-network'
import { parse } from 'yaml'
import { config, HookCollectionType } from '../../core/index.js'
import { logger } from '../../util/logger.js'

async function load_config () {
    // @ts-ignore
    const { proxy: { secrets_path } }: { proxy: { secrets_path: string } } = config
    const file = await readFile(secrets_path)
    return parse(file.toString()) as { username: string, password: string }
}

const proxy = new VirtualBIT(await load_config())
await proxy.sign_in(cli.display_captcha_then_ask_from_command_line({ width: '80%' }))
logger.info('Signed in successfully.', { plugin: 'proxy' })

// 下面一行是玄学。有些网站（如 mec）的二级页面需要先用`proxy`访问任意网址，不然会炸。
await proxy.fetch('http://mec.bit.edu.cn')

export default function add_proxy_hook (hook: HookCollectionType) {
    hook.wrap('request', async (original_fetch, options) => {
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

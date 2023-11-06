import {
  ask_from_command_line,
  display_captcha_then_ask_from_command_line,
  save_captcha_then_ask_from_command_line,
} from './captcha_handlers.ts'
import { decrypt_URL, encrypt_URL } from './convert.ts'
import { type CaptchaHandler, prepare, sign_in } from './webvpn.ts'

export { decrypt_URL, encrypt_URL }
export type { CaptchaHandler }
export const cli = {
  ask_from_command_line,
  save_captcha_then_ask_from_command_line,
  display_captcha_then_ask_from_command_line,
}

export class VirtualBIT {
  username: string
  password: string
  cookie: string | null

  constructor ({ username, password }: { username: string, password: string }) {
    this.username = username
    this.password = password
    this.cookie = null
  }

  async sign_in (resolve_captcha: CaptchaHandler = async () => '') {
    const prep = await prepare()
    await sign_in({ username: this.username, password: this.password }, prep, resolve_captcha)
    this.cookie = prep.cookie
  }

  /**
   * 原始`fetch`的包装
   * @param url
   * @param init
   * @returns
   * 传入的 cookie 会丢失。
   */
  fetch (url: RequestInfo, init?: RequestInit | undefined): Promise<Response> {
    if (this.cookie === null) {
      throw new Error('Should sign in first.')
    }

    // 1. Encrypt the URL
    if (typeof url === 'string') {
      url = encrypt_URL(url)
    } else {
      // `Request` objects' properties are read only.
      url = new Request(encrypt_URL(url.url), url)
    }

    // 2. Add cookie
    if (typeof url !== 'string') {
      url.headers.set('cookie', this.cookie)
    }
    if (init?.headers) {
      const headers = new Headers(init.headers)
      headers.set('cookie', this.cookie)
      init.headers = headers
    } else if (init) {
      init.headers = { cookie: this.cookie }
    } else {
      init = { headers: { cookie: this.cookie } }
    }

    return fetch(url, init)
  }
}

export default VirtualBIT

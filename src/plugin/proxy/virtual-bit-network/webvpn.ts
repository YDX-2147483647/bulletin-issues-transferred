/**
 * 登录网站
 */

import { load as load_html } from 'cheerio'
import fetch, { Response } from 'node-fetch'
import { encryptPassword } from '../lib/encryptPassword.js'
import { to_form_data } from './util.js'

/** auth server URL with trailing slash */
const auth_server = 'https://webvpn.bit.edu.cn/https/77726476706e69737468656265737421fcf84695297e6a596a468ca88d1b203b/authserver/'

export type CaptchaHandler = (image: Response) => Promise<string>

export interface Preparation {
  salt: string
  execution: string
  cookie: string
}

export async function prepare (): Promise<Preparation> {
  const response = await fetch(auth_server + 'login')
  const html = await response.text()

  const $ = load_html(html)
  return {
    salt: $('input#pwdEncryptSalt').attr('value') as string,
    execution: $('input#execution').attr('value') as string,
    cookie: response.headers.get('Set-Cookie') as string,
  }
}

/** 检查是否需要验证码 */
async function need_captcha (username: string): Promise<boolean> {
  const url = new URL(auth_server + 'checkNeedCaptcha.htl')
  url.searchParams.set('username', username)

  const response = await fetch(url.href)
  const json = await response.json() as { isNeed: boolean }
  return json.isNeed
}

/**
 * 获取验证码图像
 * @param cookie {@link prepare}返回的`cookie`
 * @returns HTTP 响应
 * 不总需要获取验证码，请先{@link need_captcha}。
 *
 * @example
 * const res = await fetch_captcha(cookie)
 * res.body?.pipe(fs.createWriteStream('captcha.png'))
 */
function fetch_captcha (cookie: string): Promise<Response> {
  return fetch(auth_server + 'getCaptcha.htl', {
    headers: { cookie },
  })
}

/**
 * 登录
 * @param param0
 * @param param1 {@link prepare}
 * @param resolve_captcha 如果需要验证码，会从`await resolve_captcha(image)`获取验证码，其中`image`会由{@link fetch_captcha}获取。默认不填验证码。
 */
export async function sign_in (
  { username, password }: { username: string, password: string },
  { execution, cookie, salt }: Preparation,
  resolve_captcha: CaptchaHandler,
): Promise<void> {
  // 1. Handle captcha

  let captcha = null as string | null
  if (await need_captcha(username)) {
    captcha = await fetch_captcha(cookie).then(resolve_captcha)
  }

  // 2. Post the sign in form

  const response = await fetch(auth_server + 'login', {
    method: 'POST',
    headers: { cookie },
    body: to_form_data({
      username,
      password: encryptPassword(password, salt),
      captcha,
      rememberMe: true,
      _eventId: 'submit',
      cllt: 'userNameLogin',
      dllt: 'generalLogin',
      lt: '',
      execution,
    }),
  })

  // 3. Check why failed

  if (response.status !== 200) {
    const html = await response.text()
    const $ = load_html(html)
    const reason = $('#showErrorTip')?.prop('innerText') || 'Unknown reason'
    throw new Error(`Sign in failed with ${response.status} ${response.statusText}: ${reason}.`)
  }
}

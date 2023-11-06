/**
 * 两种 URL 相互转换
 *
 * [Original version on bit.edu.cn](https://webvpn.bit.edu.cn/wengine-vpn/js/js/portal.js)
 *
 * [Cleaned by spencerwooo](https://github.com/spencerwooo/bit-webvpn-converter/blob/c97806011cc3113a5090d7b7f919c7d868bd090d/src/components/convert.ts).
 *
 * [Modified by Y.D.X. in August 2021.](https://github.com/YDX-2147483647/bit-webvpn-converter-bidirectional/blob/917110073e6547b4820d77b6d8a4e4ab7d855fa3/src/common/convert.js)
 *
 * (This's the 4th version.)
 */

import aesjs from 'aes-js'

const utf8 = aesjs.utils.utf8
const hex = aesjs.utils.hex
const AesCfb = aesjs.ModeOfOperation.cfb

const magic_word = 'wrdvpnisthebest!'

const textRightAppend = (text: string, mode: string) => {
  const segmentByteSize = mode === 'utf8' ? 16 : 32
  if (text.length % segmentByteSize === 0) {
    return text
  }

  const appendLength = segmentByteSize - (text.length % segmentByteSize)
  let i = 0
  while (i++ < appendLength) {
    text += '0'
  }
  return text
}

const encrypt = (text: string, key: string, iv: string) => {
  const textLength = text.length
  text = textRightAppend(text, 'utf8')

  const keyBytes = utf8.toBytes(key)
  const ivBytes = utf8.toBytes(iv)
  const textBytes = utf8.toBytes(text)

  const aesCfb = new AesCfb(keyBytes, ivBytes, 16)
  const encryptBytes = aesCfb.encrypt(textBytes)

  return (
    hex.fromBytes(ivBytes) +
    hex.fromBytes(encryptBytes).slice(0, textLength * 2)
  )
}

// eslint-disable-next-line
const decrypt = (text: string, key: string) => {
  const textLength = (text.length - 32) / 2
  text = textRightAppend(text, 'hex')

  const keyBytes = utf8.toBytes(key)
  const ivBytes = hex.toBytes(text.slice(0, 32))
  const textBytes = hex.toBytes(text.slice(32))

  const aesCfb = new AesCfb(keyBytes, ivBytes, 16)
  const decryptBytes = aesCfb.decrypt(textBytes)

  return utf8.fromBytes(decryptBytes).slice(0, textLength)
}

/**
 * 猜测 URL 协议类型
 * @param url_str
 * @returns 补足协议类型的 URL
 */
function guess_protocol (url_str: string): string {
  if (!url_str.includes('://')) {
    if (url_str.includes('.bit.edu.cn')) {
      return 'http://' + url_str
    } else {
      return 'https://' + url_str
    }
  } else {
    return url_str
  }
}

/**
 * 普通 URL 转 WebVPN URL
 * @param url_str 普通 URL
 * @returns WebVPN URL
 * @version 1.0
 * @description 与 0.0 版的区别：此版本返回值是完整 URL，使用 URL API（无需特别处理 IPv6）；但无法处理 SSH 等。
 * @see {@link decrypt_URL}
 */
export function encrypt_URL (url_str: string): string {
  const url = new URL(guess_protocol(url_str))

  const protocol = url.protocol.slice(0, -1).toLowerCase() // "https:" -> "https"
  const port = url.port
  const pathname_etc = url.pathname + url.search + url.hash

  const protocol_and_port = port ? `${protocol}-${port}` : protocol
  const cipher = encrypt(url.hostname, magic_word, magic_word)

  return `https://webvpn.bit.edu.cn/${protocol_and_port}/${cipher}${pathname_etc}`
}

/**
 * WebVPN URL 转普通 URL
 * @param url_str WebVPN URL
 * @returns 普通 URL
 * @version 1.3 Node.js 的 URL 和浏览器中的不完全相同。
 * @description 非 WebVPN URL 将报错。
 * @see {@link encrypt_URL}
 */
export function decrypt_URL (url_str: string): string {
  const url = new URL(guess_protocol(url_str))
  if (url.hostname !== 'webvpn.bit.edu.cn') {
    throw RangeError('只能转换 WebVPN URL。')
  }
  if (url.pathname === '' || url.pathname === '/') {
    return url.href
  }

  const [, protocol_and_port, cipher] = url.pathname.split('/', 3)
  const pathname_etc = url.pathname.slice(`/${protocol_and_port}/${cipher}`.length) + url.search + url.hash

  const hostname = decrypt(cipher, magic_word) // `hostname`无法修改
  // ↓ 这里原来是`nothing`，可能导致之后`protocol`无法更改。
  const host_etc = new URL('https://' + hostname)

  const match_obj = protocol_and_port.match(
    /^(?<protocol>[-0-9a-z]+?)(-(?<port>\d+))?$/)
  if (match_obj === null || match_obj.groups === undefined) {
    throw RangeError('无法识别 WebVPN URL 的协议或端口。')
  }
  // 以下两个 URL API 都会自动转换。
  host_etc.protocol = match_obj.groups.protocol
  // 此后`host_etc.href`结尾可能有“/”
  host_etc.port = match_obj.groups.port

  if (host_etc.href.endsWith('/')) {
    return host_etc.href.slice(0, -1) + pathname_etc
  } else {
    return host_etc.href + pathname_etc
  }
}

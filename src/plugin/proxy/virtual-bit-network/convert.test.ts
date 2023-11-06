import { decrypt_URL, encrypt_URL } from './convert.js'

const pairs = [
  {
    original: 'https://dzb.bit.edu.cn/',
    encrypted: 'https://webvpn.bit.edu.cn/https/77726476706e69737468656265737421f4ed43d225397c1e7b0c9ce29b5b/',
  },
  {
    original: 'https://dzb.bit.edu.cn/whatever',
    encrypted: 'https://webvpn.bit.edu.cn/https/77726476706e69737468656265737421f4ed43d225397c1e7b0c9ce29b5b/whatever',
  },
  {
    original: 'https://dzb.bit.edu.cn/whatever/',
    encrypted: 'https://webvpn.bit.edu.cn/https/77726476706e69737468656265737421f4ed43d225397c1e7b0c9ce29b5b/whatever/',
  },
  {
    original: 'http://jwms.bit.edu.cn/',
    encrypted: 'https://webvpn.bit.edu.cn/http/77726476706e69737468656265737421fae04c8f69326144300d8db9d6562d/',
  },
  {
    original: 'http://stu.bit.edu.cn/xsfw/sys/jbxxapp/*default/index.do#/wdxx',
    encrypted: 'https://webvpn.bit.edu.cn/http/77726476706e69737468656265737421e3e354d225397c1e7b0c9ce29b5b/xsfw/sys/jbxxapp/*default/index.do#/wdxx',
  },
]

test('Encrypt URL', () => {
  for (const { original, encrypted } of pairs) {
    expect(encrypt_URL(original)).toBe(encrypted)
  }
})

test('Decrypt URL', () => {
  for (const { original, encrypted } of pairs) {
    expect(decrypt_URL(encrypted)).toBe(original)
  }
})

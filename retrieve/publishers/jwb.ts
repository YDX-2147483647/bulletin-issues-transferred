import type { Publisher } from '../../types.ts'
import { parse } from '../by_selectors.ts'
import ky from '../ky.ts'

export default {
  name: '教务部',
  url: 'https://jwb.bit.edu.cn/tzgg/index.htm',
  description: `
早先是[教务“处”（jwc）](https://jwc.bit.edu.cn)，2022年改版后迁移至此。
`,
  async retrieve() {
    const html = await ky.get(this.url).text()
    return parse(html, { rows: 'ul.block-list57 li' }, this.url)
  },
} satisfies Publisher

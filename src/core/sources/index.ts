/**
 * 导入通知来源
 * 
 * 一般外界不需要`import`此目录的其它模块。
 * 
 * @module
 */

import { Source } from '../models.js'

import import_sources_by_selectors from './by_selectors.js'
import import_sources_special from './special.js'



export default async function import_sources(): Promise<Source[]> {
    const promises = [
        import_sources_by_selectors(),
        import_sources_special(),
    ]
    const source_groups = await Promise.all(promises)
    return source_groups.flat()
}

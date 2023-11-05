/**
 * 导入通知来源
 *
 * 一般外界不需要`import`此目录的其它模块。
 *
 * @module
 */

import { Source } from '../models.ts'

import import_sources_by_selectors from './by_selectors.ts'
import import_sources_special from './special.ts'

/**
 * @param param0
 * @param param0.sources_by_selectors_path `sources_by_selectors.json`
 */
export default async function import_sources ({ sources_by_selectors_path }: { sources_by_selectors_path: string }): Promise<Source[]> {
    const promises = [
        import_sources_by_selectors({ path: sources_by_selectors_path }),
        import_sources_special(),
    ]
    const source_groups = await Promise.all(promises)
    return source_groups.flat()
}

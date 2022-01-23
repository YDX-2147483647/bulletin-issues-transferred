/**
 * 导入通知来源
 * @module
 */
import { readFile } from 'fs/promises'
import chalk from "chalk"

import config from './config/config.js'
import { SourceStorageFormat, SourceInterface } from "./interfaces"
import { SourceBySelectorsRaw, SourceBySelectors } from './notice.js'
import { parse_special_source } from './config/sources_special.js'



async function _import_sources() {
    const file = await readFile(config.sources_path)
    const raw_sources: SourceStorageFormat[] = JSON.parse(file.toString()).sources

    const sources = raw_sources.map(s => {
        switch (s.fetch_by) {
            case 'selectors':
                return new SourceBySelectors(s as SourceBySelectorsRaw)
                break
            case 'special':
                return parse_special_source(s)
                break

            default:
                console.error(chalk.red(`✗ 无法识别的 fetch_by：${s.fetch_by}。`))
                break
        }
    })
    return sources
}

let _sources_cache: SourceInterface[] = []

/**
 * 从`config.sources_path`和{@link sources_special}导入通知来源
 * @param options 选项 
 * @param options.force 是否强制刷新缓存。因为通知来源基本不变，默认会自动采用缓存。
 */
export async function import_sources({ force = false } = {}) {
    if (force || _sources_cache.length == 0) {
        try {
            _sources_cache = await _import_sources()
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(chalk.red(`✗ 未找到任何通知来源。您可能需要新建 ${config.sources_path}。`))
            }
            throw error
        }
    }

    if (_sources_cache.length === 0) {
        console.log(chalk.red(`✗ 未找到任何通知来源。${config.sources_path} 可能是空的。`))
    }

    return _sources_cache
}

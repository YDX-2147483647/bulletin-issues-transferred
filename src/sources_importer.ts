import { readFile } from 'fs/promises'
import chalk from "chalk"

import { SourceRaw, SourceInterface } from "./notice.js"
import { SourceBySelectorsRaw, SourceBySelectors } from './notice.js'
import { parse_special_source } from './sources_special.js'



export interface SourceStorageFormat extends SourceRaw {
    fetch_by: string,
    selectors?: any
}

async function _import_sources() {
    const file = await readFile('config/notice_sources.json')
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
export async function import_sources({ force = false } = {}) {
    if (force || _sources_cache.length == 0) {
        try {
            _sources_cache = await _import_sources()
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(chalk.red('✗ 未找到任何通知来源。您可能需要新建 config/notice_sources.json。'))
            }
            throw error
        }
    }

    if (_sources_cache.length === 0) {
        console.log(chalk.red('✗ 未找到任何通知来源。config/notice_sources.json 可能是空的。'))
    }

    return _sources_cache
}

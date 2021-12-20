import { readFile, writeFile } from 'fs/promises'
import chalk from "chalk"

import { SourceRaw, SourceBySelectors, Notice, NoticeRaw } from "./notice.js"
import { build_feed } from "./feed.js"


async function _import_sources_by_selectors() {
    const file = await readFile('config/notice_sources.json')
    const raw_sources: SourceRaw[] = JSON.parse(file.toString()).sources
    const sources = raw_sources.map(r => new SourceBySelectors(r))
    return sources
}

let _sources_by_selectors_cache: SourceBySelectors[] = []
export async function import_sources_by_selectors({ force = false } = {}) {
    if (force || _sources_by_selectors_cache.length == 0) {
        try {
            _sources_by_selectors_cache = await _import_sources_by_selectors()
        } catch (error) {
            if (error.code === 'ENOENT') {
                console.error(chalk.red('✗ 未找到任何通知来源。您可能需要新建 config/notice_sources.json。'))
            }
            throw error
        }
    }

    if (_sources_by_selectors_cache.length === 0) {
        console.log(chalk.red('✗ 未找到任何通知来源。config/notice_sources.json 可能是空的。'))
    }

    return _sources_by_selectors_cache
}


/**
 * 自动转换为`Date`。
 */
function json_date_reviver(key: string, value: any) {
    if (key === 'date') {
        return new Date(value)
    }
    return value
}


export async function read_json({ ignore_source = false } = {}) {
    try {
        const json_str = (await readFile('data/notices.json')).toString()
        const json: NoticeRaw[] = JSON.parse(json_str, json_date_reviver)

        if (ignore_source) {
            return json.map(n => new Notice(n)) as Notice[]
        } else {
            const sources_set = await import_sources_by_selectors()
            return json.map(n => new Notice(n, { sources_set })) as Notice[]
        }


    } catch (error) {
        if (error.code === 'ENOENT') {
            console.log(chalk.yellow(`⚠ 未找到以往通知，您可能是第一次运行。将忽略。`))
            return []
        } else {
            throw error
        }
    }
}

export async function write_json(notices: Notice[]) {
    const json = JSON.stringify(notices.map(n => n.to_raw()), null, 2)
    await writeFile('data/notices.json', json)
    console.log(chalk.green('✓'), '已保存到 data/notices.json。')
}

export async function write_rss(notices: Notice[]) {
    await writeFile('data/feed.rss', build_feed(notices))
    console.log(chalk.green('✓'), '已保存到 data/feed.rss')
}

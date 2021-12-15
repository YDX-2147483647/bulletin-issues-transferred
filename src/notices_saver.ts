import { readFile, writeFile } from 'fs/promises'
import chalk from "chalk"

import { SourceRaw, Source, Notice } from "./notice.js"
import { build_feed } from "./feed.js"


async function _import_sources() {
    const file = await readFile('config/notice_sources.json')
    const raw_sources: SourceRaw[] = JSON.parse(file.toString()).sources
    const sources = raw_sources.map(r => new Source(r))
    return sources
}

let _sources_cache = []
export async function import_sources({ force = false } = {}) {
    if (force || _sources_cache.length == 0) {
        _sources_cache = await _import_sources()
    }

    if (_sources_cache.length === 0) {
        console.log(chalk.red('✗ 未找到任何通知来源。'))
    }
    return _sources_cache
}


function json_replacer(key: string, value: any) {
    if (key === 'source') {
        return value.name
    }
    return value
}

function json_reviver(sources: Source[]) {
    return (key: string, value: any) => {
        if (key === 'date') {
            return new Date(value)
        } else if (key === 'source') {
            const real_source = sources.find(s => s.name === value)
            if (!real_source) {
                console.log(chalk.yellow(`⚠ 未知的来源：${value}。将保留原状。`))
            }
            return real_source || value
        }
        return value
    }
}


export async function read_json({ ignore_source = false } = {}) {
    const sources = await import_sources()

    const json = (await readFile('data/notices.json')).toString()
    return JSON.parse(json, json_reviver(sources)) as Notice[]
}

export async function write_json(notices: Notice[]) {
    const json = JSON.stringify(notices, json_replacer, 2)
    await writeFile('data/notices.json', json)
    console.log(chalk.green('✓'), '已保存到 data/notices.json。')
}

export async function write_rss(notices: Notice[]) {
    await writeFile('data/feed.rss', build_feed(notices))
    console.log(chalk.green('✓'), '已保存到 data/feed.rss')
}


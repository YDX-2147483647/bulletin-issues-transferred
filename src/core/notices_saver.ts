/**
 * 读取、写入通知（或者说从文件恢复、保存至文件）
 * @module
 */
import { readFile, writeFile } from 'fs/promises'
import chalk from "chalk"

import { NoticeInterface, NoticeRaw, Notice } from "./notice.js"
import { import_sources } from './sources_importer.js'



/**
 * 自动转换为`Date`。
 */
function json_date_reviver(key: string, value: any) {
    if (key === 'date') {
        return value === 'null' ? null : new Date(value)
    }
    return value
}


/**
 * 从`data/notices.json`读取已有通知
 * @param options 选项
 * @param options.ignore_source 是否忽略来源。因为存储来源时只记`name`，读取时可能需要还原为{@link Source}。
 */
export async function read_json({ ignore_source = false } = {}) {
    try {
        const json_str = (await readFile('data/notices.json')).toString()
        const json: NoticeRaw[] = JSON.parse(json_str, json_date_reviver)

        if (ignore_source) {
            return json.map(n => new Notice(n))
        } else {
            const sources_set = await import_sources()
            return json.map(n => new Notice(n, { sources_set }))
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

/**
 * 将通知写入`data/notices.json`（不是追加）
 * @param notices 
 */
export async function write_json(notices: NoticeInterface[]) {
    const json = JSON.stringify(notices.map(n => n.to_raw()), null, 2)
    await writeFile('data/notices.json', json)
    console.log(chalk.green('✓'), '已保存到 data/notices.json。')
}

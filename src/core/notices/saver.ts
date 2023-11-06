/**
 * 读取、写入通知（或者说从文件恢复、保存至文件）
 * @module
 */
import { readFile, writeFile } from 'node:fs/promises'
import { logger } from '../../util/logger.ts'
import { Notice, type NoticeInterface } from '../models.ts'

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
 * 从`path`读取已有通知
 *
 * 不会填充`source`，如需要，请使用{@link Notice.populate}。
 */
export async function read_json({ path }: { path: string }) {
    try {
        const json_str = (await readFile(path)).toString()
        const json: NoticeInterface[] = JSON.parse(json_str, json_date_reviver)

        return json.map((n) => new Notice(n))
    } catch (error) {
        if (error.code === 'ENOENT') {
            logger.warn('未找到以往通知，您可能是第一次运行。将忽略。')
            return []
        } else {
            throw error
        }
    }
}

/**
 * 将通知写入`path`（不是追加）
 * @param notices
 */
export async function write_json(
    notices: Notice[],
    { path }: { path: string },
) {
    const json = JSON.stringify(notices.map((n) => n.to_raw()), null, 2)
    await writeFile(path, json)
}

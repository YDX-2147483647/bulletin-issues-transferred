/**
 * 更新通知
 */

import chalk from 'chalk'
import { hook, update_notices } from '../../../core/index.js'
import { add_hook } from '../../cli/index.js'
import robot from '../index.js'

add_hook.verbose(hook)
add_hook.progress_bar(hook)

const { all_notices, new_notices, change } = await update_notices()

if (change.add === 0) {
    const message_rows = [
        '未发现新通知。',
        '以下是最新的3项通知。',
        ...all_notices.slice(0, 3).map(n => '-   ' + n.to_markdown()),
    ]

    await robot.markdown('未发现新通知', message_rows.join('\n\n'))
} else {
    const message_rows = [
        `发现 ${new_notices.length} 项新通知。`,
        ...new_notices.slice(0, 20).map(n => '-   ' + n.to_markdown()),
        `新增 ${change.add} 项，过期 ${change.drop} 项。`,
    ]

    await robot.markdown('发现新通知', message_rows.join('\n\n'))
}
console.log(chalk.green('🛈'), '已发送到 i 北理。')

/**
 * 更新通知
 */

import { hook, update_notices } from '../core/index.ts'
import { add_hook } from '../plugin/cli/index.ts'
import robot from '../plugin/ding/index.ts'
import add_normalize_hook from '../plugin/normalize/index.ts'
import add_retry_hook from '../plugin/retry/index.ts'
import { logger } from '../util/logger.ts'

add_hook.verbose(hook)
add_hook.progress_bar(hook)
add_retry_hook(hook)
add_normalize_hook(hook)

const { all_notices, new_notices, change } = await update_notices()

if (change.add === 0) {
    const message_rows = [
        '未发现新通知。',
        '以下是最新的3项通知。',
        ...all_notices.slice(0, 3).map((n) => '-   ' + n.to_markdown()),
    ]

    await robot.markdown('未发现新通知', message_rows.join('\n\n'))
} else {
    const message_rows = [
        `发现 ${new_notices.length} 项新通知。`,
        ...new_notices.slice(0, 20).map((n) => '-   ' + n.to_markdown()),
        `新增 ${change.add} 项，过期 ${change.drop} 项。`,
    ]

    await robot.markdown('发现新通知', message_rows.join('\n\n'))
}
logger.info('已发送到 i 北理。', { plugin: 'ding' })

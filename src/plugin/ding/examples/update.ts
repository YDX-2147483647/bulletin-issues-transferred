/**
 * 更新通知
 */

import { Hook } from 'before-after-hook'
import type { HooksType } from '../../../core/hooks_type.js'
import { update_notices } from '../../../core/update_notices.js'
import robot from '../index.js'

const { all_notices, new_notices, change } = await update_notices({
    _hook: new Hook.Collection<HooksType>(),
})

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

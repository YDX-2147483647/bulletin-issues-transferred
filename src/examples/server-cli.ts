/**
 * 更新通知
 */

import { hook, update_notices } from '../core/index.js'
import { add_hook } from '../plugin/cli/index.js'
import add_proxy_hook from '../plugin/proxy/index.js'
import add_rss_hook from '../plugin/rss/index.js'

add_hook.verbose(hook)
add_hook.progress_bar(hook)
add_proxy_hook(hook)
add_rss_hook(hook)

await update_notices()

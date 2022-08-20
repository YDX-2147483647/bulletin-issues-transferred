import { hook, update_notices } from '../core/index.js'
import { add_hook } from '../plugin/cli/index.js'

add_hook.verbose(hook)
add_hook.preview_output(hook)
add_hook.progress_bar(hook)
add_hook.recent_filter(hook, 90)

await update_notices()

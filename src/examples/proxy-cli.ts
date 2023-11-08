import { hook, update_notices } from '../core/index.js'
import { add_hook } from '../plugin/cli/index.js'
import add_proxy_hook from '../plugin/proxy/index.js'
import add_normalize_hook from '../plugin/normalize/index.js'

add_hook.verbose(hook)
add_hook.preview_output(hook)
add_hook.progress_bar(hook)
add_proxy_hook(hook)
add_normalize_hook(hook)

await update_notices()

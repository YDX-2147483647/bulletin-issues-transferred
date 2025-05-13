import { hook, update_notices } from '../core/index.ts'
import { add_hook } from '../plugin/cli/index.ts'
import add_normalize_hook from '../plugin/normalize/index.ts'
import add_proxy_hook from '../plugin/proxy/index.ts'
import add_retry_hook from '../plugin/retry/index.ts'

add_hook.verbose(hook)
add_hook.preview_output(hook)
add_hook.progress_bar(hook)
add_proxy_hook(hook)
add_retry_hook(hook)
add_normalize_hook(hook)

await update_notices()

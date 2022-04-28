import { update_notices } from "./update_notices.js"
import { print_notices } from "./plugin/cli/index.js"



const { all_notices, new_notices, change } = await update_notices()

if (change.add === 0) {
    console.log('未发现新通知。')
    print_notices(all_notices,
        { max: 3, remark_if_overflow: false })
    console.log('以上是最新的3项通知。')

} else {
    console.log(`发现 ${change.add} 项新通知。`)
    print_notices(new_notices, { max: 20 })
    console.log(`新增 ${change.add} 项，过期 ${change.drop} 项。`)
}

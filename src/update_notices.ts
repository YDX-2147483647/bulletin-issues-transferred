import { writeFile } from "fs/promises"
import { fetch_all_sources } from './notice.js'
import { build_feed } from "./feed.js"
import chalk from "chalk"

const notices = (await fetch_all_sources({ verbose: true }))
    .sort((a, b) => b.date?.getTime() - a.date?.getTime())

const json = JSON.stringify(notices, (key, value) => {
    if (key === 'source') {
        return value.name
    } else {
        return value
    }
}, 2)
await writeFile('data/notices.json', json)
console.log(chalk.green('✓'), '已保存到 data/notices.json。')

await writeFile('data/feed.rss', build_feed(notices))
console.log(chalk.green('✓'), '已保存到 data/feed.rss')

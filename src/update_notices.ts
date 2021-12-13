import { fetch_all_sources, Notice } from './notice.js'
import { writeFile } from "fs/promises"
import { build_feed } from "./feed.js"
import chalk from "chalk"



async function get_notices_and_filter_out_the_recent() {
    const today = new Date()
    const ninety_days_ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90)

    const notices = (await fetch_all_sources({ verbose: true }))
        .filter(b => b.date === null || b.date.getTime() >= ninety_days_ago.getTime())
        .sort((a, b) => b.date?.getTime() - a.date?.getTime())

    console.log(chalk.green('🛈'), `共筛选出${notices.length}条90天内的通知。`)

    return notices
}


async function save_json(notices: Notice[]) {
    const json = JSON.stringify(notices, (key, value) => {
        if (key === 'source') {
            return value.name
        } else {
            return value
        }
    }, 2)
    await writeFile('data/notices.json', json)
    console.log(chalk.green('✓'), '已保存到 data/notices.json。')
}

async function save_rss(notices: Notice[]) {
    await writeFile('data/feed.rss', build_feed(notices))
    console.log(chalk.green('✓'), '已保存到 data/feed.rss')
}


const notices = await get_notices_and_filter_out_the_recent()
save_json(notices)
save_rss(notices)

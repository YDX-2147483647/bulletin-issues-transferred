import { fetch_all_sources, Notice } from './notice.js'
import { writeFile, readFile } from "fs/promises"
import { build_feed } from "./feed.js"
import chalk from "chalk"



async function get_notices_and_filter_out_the_recent() {
    const today = new Date()
    const ninety_days_ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90)

    const notices = (await fetch_all_sources({ verbose: true }))
        .filter(n => n.date === null || n.date.getTime() >= ninety_days_ago.getTime())
        .sort((a, b) => b.date?.getTime() - a.date?.getTime())

    console.log(`共筛选出${notices.length}条90天内的通知。`)

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

async function read_existed_links() {
    const json: Notice[] = JSON.parse((await readFile('data/notices.json')).toString())
    return json.map(n => n.link)
}

async function diff(notices: Notice[]) {
    const existed_links = await read_existed_links()
    return notices.filter(n => !existed_links.includes(n.link))
}

const notices = await get_notices_and_filter_out_the_recent()
const new_notices = await diff(notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')
} else {
    console.log(`发现${new_notices.length}项新通知。`)
    console.log(new_notices)

    save_json(notices)
    save_rss(notices)
}

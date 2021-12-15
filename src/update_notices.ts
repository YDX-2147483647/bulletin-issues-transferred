import { fetch_all_sources, Notice, import_sources, notices_json_reviver, notices_json_replacer, notices_to_human_readable } from './notice.js'
import { writeFile, readFile } from "fs/promises"
import { build_feed } from "./feed.js"
import chalk from "chalk"



/**
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 */
function sort_by_date(a: Notice, b: Notice) {
    if (a.date === null) {
        return 1
    }
    if (b.date === null) {
        return -1
    }
    return b.date.getTime() - a.date.getTime()
}


async function get_notices_and_filter_out_the_recent() {
    const today = new Date()
    const ninety_days_ago = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 90)

    const notices = (await fetch_all_sources({ verbose: true }))
        .filter(n => n.date === null || n.date.getTime() >= ninety_days_ago.getTime())
        .sort(sort_by_date)

    console.log(`共筛选出${notices.length}条90天内的通知。`)

    return notices
}


async function save_json(notices: Notice[]) {
    const json = JSON.stringify(notices, notices_json_replacer, 2)
    await writeFile('data/notices.json', json)
    console.log(chalk.green('✓'), '已保存到 data/notices.json。')
}

async function save_rss(notices: Notice[]) {
    await writeFile('data/feed.rss', build_feed(notices))
    console.log(chalk.green('✓'), '已保存到 data/feed.rss')
}


async function read_existed_links() {
    const notices: Notice[] = JSON.parse((await readFile('data/notices.json')).toString())
    return notices.map(n => n.link)
}

async function read_existed_notices() {
    const sources = await import_sources()
    
    const json = (await readFile('data/notices.json')).toString()
    return JSON.parse(json, notices_json_reviver(sources)) as Notice[]
}

async function diff(notices: Notice[]) {
    const existed_links = await read_existed_links()
    return notices.filter(n => !existed_links.includes(n.link))
}



const notices = await get_notices_and_filter_out_the_recent()
const new_notices = await diff(notices)

if (new_notices.length === 0) {
    console.log('未发现新通知。')

    console.log(notices_to_human_readable(
        (await read_existed_notices()).slice(0, 5)
    ))
    console.log('以上是最新的5项通知。')

} else {
    console.log(`发现${new_notices.length}项新通知。`)

    new_notices.forEach(n => { n.date = new Date() })
    notices.sort(sort_by_date)

    console.log(notices_to_human_readable(new_notices))

    save_json(notices)
    save_rss(notices)
}

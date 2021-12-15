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


function to_json(notices: Notice[]) {
    return JSON.stringify(notices, (key, value) => {
        if (key === 'source') {
            return value.name
        } else {
            return value
        }
    }, 2)
}

function to_human_readable(notices: Notice[]) {
    return notices.map((notice, index) => [
        chalk.underline(String(index + 1).padStart(2, ' ')) +
        `  ${notice.source.name}｜${notice.title}`,
        `    ${notice.link}`,
        `    ${notice.date ? notice.date.toLocaleString() : '（未知日期）'}`
    ].join('\n')).join('\n\n')
}


async function save_json(notices: Notice[]) {
    const json = to_json(notices)
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
    console.log('以下是最新的5项通知。')
    console.log(to_human_readable(notices.slice(0, 5)))

} else {
    console.log(`发现${new_notices.length}项新通知。`)
    console.log(to_human_readable(new_notices))

    save_json(notices)
    save_rss(notices)
}

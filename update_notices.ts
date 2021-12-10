import { writeFile } from "fs/promises"
import { fetch_all_sources } from './notice.js'
import { build_feed } from "./feed.js"

const notices = (await fetch_all_sources()).sort((a, b) => b.date.getTime() - a.date.getTime())

const json = JSON.stringify(notices, (key, value) => {
    if (key === 'source') {
        return value.name
    } else {
        return value
    }
}, 2)
writeFile('data/notices.json', json)

writeFile('data/feed.rss', build_feed(notices))

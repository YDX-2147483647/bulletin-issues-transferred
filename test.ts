import { writeFile } from "fs/promises"
import { fetch_all_sources } from './notice.js'

const notices = await fetch_all_sources()
const notices_sorted = notices.sort((a, b) => b.date.getTime() - a.date.getTime())

const json = JSON.stringify(notices_sorted, (key, value) => {
    if (key === 'source') {
        return value.name
    } else {
        return value
    }
}, 2)
writeFile('data/notices.json', json)

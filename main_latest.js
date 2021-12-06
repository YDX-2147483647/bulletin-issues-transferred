import fetch from "node-fetch"
import { JSDOM } from "jsdom"

async function fetch_main_latest() {
    const url = 'https://www.bit.edu.cn/tzgg17/zxtz/index.htm'
    const html = await (await fetch(url)).text()
    const dom = new JSDOM(html)

    const rows = dom.window.document.querySelectorAll('.title_rtcon li')
    return Array.from(rows).map(row => ({
        link: (new URL(row.querySelector('a').href, url)).href,
        title: row.querySelector('a').textContent,
        date: new Date(row.querySelector('span').textContent)
    }))
}

fetch_main_latest().then(console.log)

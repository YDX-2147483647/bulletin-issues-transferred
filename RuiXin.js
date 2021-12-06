import fetch from 'node-fetch'
import { JSDOM } from 'jsdom'


/**
 * 
 * @param {Element} row 
 */
function split_row(row) {
    const link = row.querySelector('a').href,
        title = row.querySelector('a').textContent,
        date = new Date(row.querySelector('span').textContent)

    return { link, title, date }
}

async function fetch_RuiXin() {
    const url = 'https://www.bit.edu.cn/rcpy_sjb/blsy87/rxsygb/tzggsy2/index.htm'
    const html = await (await fetch(url)).text()
    const dom = new JSDOM(html)

    const prefix = url.slice(0, url.lastIndexOf('/')) + '/'
    const rows = dom.window.document.querySelectorAll('.subRight li')

    return Array.from(rows).map(split_row).map(o => {
        o.link = prefix + o.link
        return o
    })
}

fetch_RuiXin().then(console.log)

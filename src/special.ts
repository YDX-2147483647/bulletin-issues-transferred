import fetch from "node-fetch"
import { parse_date } from '../lib/my_date.js'

async function temp1() {
    const response = await fetch('https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate', { method: "post" })
    const json: any = await response.json()
    const rows = json.object as { notifyType: string, articleID: string, title: string }[]

    return rows.map(
        ({ notifyType, articleID, title }) => ({
            type: notifyType.replace('通知', ''),
            link: `https://dzb.bit.edu.cn/cms/web/search/download.jsp?id=${articleID}`,
            title,
            date: null
        })
    )
}

async function temp2() {
    const response =
        await fetch('http://mec.bit.edu.cn/pcmd/ajax.php?act=getmanage_nologin&w=新闻公告&size=20')
            .then(response => response.text())
    const json = response.split('\n').at(-1)
    const original_data = JSON.parse(json).data.data as { id: string, type: string, jmtype: string, jmdate: string, jmtitle: string, jmnr: string }[]

    return original_data.map(
        ({ id, jmtype: type, jmdate: date_str, jmtitle: title }) => ({
            type,
            link: `http://mec.bit.edu.cn/infos/details.html?id=${id}`,
            title,
            date: parse_date(date_str),
        })
    )
}

temp1().then(console.log)
temp2().then(console.log)

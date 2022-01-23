/**
 * 处理特殊的通知来源
 * @module
 */
import chalk from "chalk"
import fetch from "node-fetch"

import { parse_date } from '../../util/my_date.js'
import { Notice, Source } from '../notice.js'
import { SourceStorageFormat } from "../interfaces.js"


const specials = new Map([
    ["党政部",
        async () => {
            const response = await fetch('https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate', { method: "post" })
            const json: any = await response.json()
            const rows = Array.from(json.object) as { notifyType: string, articleID: string, title: string }[]

            return rows.map(
                ({ notifyType, articleID, title }) => ({
                    type: notifyType.replace('通知', ''),
                    link: `https://dzb.bit.edu.cn/cms/web/search/download.jsp?id=${articleID}`,
                    title,
                    date: null,
                })
            )
        }
    ],
    ["数学实验",
        async () => {
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
    ]
])




/**
 * 将特殊通知来源转换为{@link Source}
 * 
 * “特殊”指`config.sources_path`中记录的`fetch_by`为`special`。
 */
export function parse_special_source(source: SourceStorageFormat) {
    const real_source = new Source(source)

    if (specials.has(real_source.name)) {
        real_source.fetch_notice = async () => {
            const notices = await specials.get(real_source.name)()
            return notices.map(({ link, title, date }) =>
                new Notice({ link, title, date, source: real_source })
            )
        }
    } else {
        console.log(chalk.yellow(`⚠ 特殊来源“${real_source.name}”未找到抓取通知的方法。将忽略，但可能引起其它错误。`))
    }

    return real_source
}

/**
 * 特殊的通知来源
 * @module
 */

import fetch from 'node-fetch'

import { parse_date } from '../../util/my_date.js'

import { Notice, Source, type SourceInterface } from '../models.js'

interface NoticeWithoutSource {
    link: string
    title: string
    date: Date | null
}

interface SourceSpecialInterface extends SourceInterface {
    fetch_notice (): Promise<NoticeWithoutSource[]>
}

const raw_sources: SourceSpecialInterface[] = [
    {
        name: '党政部',
        full_name: '党委或行政办公室',
        url: 'https://dzb.bit.edu.cn/bftz/index.htm',
        guide: [
            '党政部',
            '校内通知',
        ],
        async fetch_notice () {
            const response = await fetch('https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate', { method: 'post' })
            const json: any = await response.json()
            const rows = Array.from(json.object) as { notifyType: string, articleID: string, title: string }[]

            return rows.map(
                ({ notifyType, articleID, title }) => ({
                    type: notifyType.replace('通知', ''),
                    link: `https://dzb.bit.edu.cn/cms/web/search/download.jsp?id=${articleID}`,
                    title,
                    date: null,
                }),
            )
        },
    },
    {
        name: '数学实验',
        full_name: '数学实验中心',
        guide: [
            '数学实验中心',
            '顶栏',
            '新闻公告',
        ],
        url: 'http://mec.bit.edu.cn/infos/index.html',
        async fetch_notice () {
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
                }),
            )
        },
    },
]

const sources = raw_sources.map(raw => {
    const source = new Source(raw)
    source.fetch_notice = async () => {
        const notices = await raw.fetch_notice()
        return notices.map(({ link, title, date }) =>
            new Notice({ link, title, date, source }),
        )
    }
    return source
})

export default async function import_sources_special (): Promise<Source[]> {
    return sources
}

/**
 * 特殊的通知来源
 * @module
 */

import { parse_date } from '../../util/my_date.js'
import hooked_fetch from '../fetch_wrapper.js'
import type { HookCollectionType } from '../hooks_type.js'
import { Notice, Source, type SourceInterface } from '../models.js'

interface NoticeWithoutSource {
    link: string
    title: string
    date: Date | null
}

interface SourceSpecialInterface extends SourceInterface {
    fetch_notice (options: { _hook: HookCollectionType }): Promise<NoticeWithoutSource[]>
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
        async fetch_notice ({ _hook }) {
            const response = await hooked_fetch({
                url: 'https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate',
                method: 'post',
                _hook,
            })
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
        async fetch_notice ({ _hook }) {
            const response =
                await hooked_fetch({
                    url: 'http://mec.bit.edu.cn/pcmd/ajax.php?vpn-12-o1-mec.bit.edu.cn&act=getmanage_nologin&w=新闻公告',
                    headers: {
                        Referer: 'http://mec.bit.edu.cn/',
                    },
                    _hook,
                })
            const json = await response.json() as { data: { data: { id: string, type: string, jmtype: string, jmdate: string, jmtitle: string, jmnr: string }[] } }
            const original_data = json.data.data

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
    {
        name: '图书馆',
        guide: [
            '图书馆',
            '动态发布',
            '通知公告',
            '更多',
        ],
        url: 'https://lib.bit.edu.cn/engine2/m/7252A82F2C1BEA45',
        async fetch_notice ({ _hook }) {
            const response =
                await hooked_fetch({
                    url: 'https://lib.bit.edu.cn/engine2/general/1430281/type/more-datas',
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
                    },
                    body: 'engineInstanceId=2047535',
                    _hook,
                })
            const json = await response.json() as {
                data: { datas: { datas: { url: string, '1': { value: string }, '6': { value: string }, id: string }[] } }
            }
            const original_data = json.data.datas.datas

            return original_data.map(
                ({ url: url_str, 1: title, 6: date, id }) => {
                    const url = new URL(url_str, 'https://lib.bit.edu.cn')
                    if (url.hostname === 'lib.bit.edu.cn') {
                        // 图书馆直接返回的是长 URL，
                        // 实际访问时再用`window.location.href`跳转到实际页面。
                        // 这里直接缩短一下。
                        url.pathname = [
                            'engine2/d',
                            id,
                            url.searchParams.get('engineInstanceId'),
                            '0',
                        ].join('/')
                        url.search = ''
                    }

                    return {
                        link: url.href,
                        title: title.value,
                        date: parse_date(date.value),
                    }
                },
            )
        },
    },
]

const sources = raw_sources.map(raw => {
    const source = new Source(raw)
    source.fetch_notice = async ({ _hook }) => {
        const notices = await raw.fetch_notice({ _hook })
        return notices.map(({ link, title, date }) =>
            new Notice({ link, title, date, source }),
        )
    }
    return source
})

export default async function import_sources_special (): Promise<Source[]> {
    return sources
}

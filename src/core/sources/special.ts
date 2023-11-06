/**
 * 特殊的通知来源
 * @module
 */

import { parse_date } from '../../util/my_date.ts'
import hooked_fetch from '../fetch_wrapper.ts'
import type { HookCollectionType } from '../hooks_type.ts'
import { Notice, Source, type SourceInterface } from '../models.ts'

interface NoticeWithoutSource {
    link: string
    title: string
    date: Date | null
    id?: string
}

interface SourceSpecialInterface extends SourceInterface {
    fetch_notice(
        options: { _hook: HookCollectionType },
    ): Promise<NoticeWithoutSource[]>
}

/**
 * 获取 lib.bit.edu.cn 的通知
 */
async function fetch_lib_notice(
    { _hook, general_id, engine_id }: {
        _hook: HookCollectionType
        general_id: string
        engine_id: string
    },
) {
    const response = await hooked_fetch({
        url: `https://lib.bit.edu.cn/engine2/general/${general_id}/type/more-datas`,
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        },
        body: `engineInstanceId=${engine_id}`,
        _hook,
    })
    const json = await response.json() as {
        data: {
            datas: {
                datas: {
                    url: string
                    '1': { value: string }
                    '6': { value: string }
                    id: string
                }[]
            }
        }
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
        async fetch_notice({ _hook }) {
            const response = await hooked_fetch({
                url: 'https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate',
                method: 'post',
                _hook,
            })
            const json: any = await response.json()
            const rows = Array.from(json.object) as {
                notifyType: string
                articleID: string
                title: string
            }[]

            return rows.map(
                ({ notifyType, articleID, title }) => ({
                    type: notifyType.replace('通知', ''),
                    link:
                        `https://dzb.bit.edu.cn/cms/web/search/download.jsp?id=${articleID}`,
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
        async fetch_notice({ _hook }) {
            const response = await hooked_fetch({
                url: 'http://mec.bit.edu.cn/pcmd/ajax.php?vpn-12-o1-mec.bit.edu.cn&act=getmanage_nologin&w=新闻公告',
                headers: {
                    Referer: 'http://mec.bit.edu.cn/',
                },
                _hook,
            })
            const json = await response.json() as {
                data: {
                    data: {
                        id: string
                        type: string
                        jmtype: string
                        jmdate: string
                        jmtitle: string
                        jmnr: string
                    }[]
                }
            }
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
        async fetch_notice({ _hook }) {
            return await fetch_lib_notice({
                general_id: '1430281',
                engine_id: '2047535',
                _hook,
            })
        },
    },
    {
        name: '图书馆讲座',
        guide: [
            '图书馆',
            '动态发布',
            '讲座活动',
            '更多',
        ],
        url: 'https://lib.bit.edu.cn/engine2/m/57D956B0E35360B0',
        async fetch_notice({ _hook }) {
            return await fetch_lib_notice({
                general_id: '1387413',
                engine_id: '1722985',
                _hook,
            })
        },
    },
    {
        name: '延河',
        full_name: '延河课堂更新日志',
        url: 'https://www.yanhekt.cn/supportCenter/releases',
        guide: [
            '延河课堂',
            '右边栏',
            '用户手册',
            '左边栏',
            '更新日志',
        ],
        async fetch_notice({ _hook }) {
            const response = await hooked_fetch({
                url: 'https://cbiz.yanhekt.cn/v1/notice/list?with_brief=false',
                headers: {
                    Referer: 'https://www.yanhekt.cn/',
                    'Xdomain-Client': 'web_user',
                },
                _hook,
            })
            const json = await response.json() as {
                data: { title: string; created_at: string; id: number }[]
            }
            const original_data = json.data

            return original_data.map(
                ({ title, created_at, id }) => ({
                    link: 'https://www.yanhekt.cn/supportCenter/releases',
                    id: `https://www.yanhekt.cn/supportCenter/releases#${id}`,
                    // 无专门页面，延河课堂网页又不支持 hash（加了就不能正常显示），只好自制 id
                    title,
                    date: parse_date(created_at),
                }),
            )
        },
    },
]

const sources = raw_sources.map((raw) => {
    const source = new Source(raw)
    source.fetch_notice = async ({ _hook }) => {
        const notices = await raw.fetch_notice({ _hook })
        return notices.map(({ link, title, date, id }) =>
            new Notice({ link, title, date, source, id })
        )
    }
    return source
})

export default async function import_sources_special(): Promise<Source[]> {
    return sources
}

/**
 * 宽松地解析日期字符串
 * @param date 2021-6-20、1-1、……
 * @description 会忽略日期两边的字符。未标时区时采用本地时间。
 */
export function parse_date(date: string) {
    const match = date.match(
        /((?<year>\d+)[-/年])?(?<month>\d+)[-/月](?<day>\d+)日?((?<hour>\d+)时)?(?![-/T\s\d])/,
    )
    if (match && match.groups) {
        return new Date(
            parseInt(match.groups.year) || (new Date()).getFullYear(),
            parseInt(match.groups.month) - 1,
            parseInt(match.groups.day),
            parseInt(match.groups.hour) || 0,
        )
    }

    return new Date(date)
}

/**
 * 按日期降序排列
 * 用于`Array.prototype.sort()`，会将日期未知的压到最后。
 * @example
 * ```
 * const notices = [notice_1, notice_2, ...]
 * notices.sort(sort_by_date)
 * ```
 */
export function sort_by_date(
    a: { date: Date | null },
    b: { date: Date | null },
) {
    if (a.date === null) {
        return 1
    }
    if (b.date === null) {
        return -1
    }
    return b.date.getTime() - a.date.getTime()
}

/**
 * 检验日期是否是最近
 *
 * 日期未知的也算最近。
 * @param days_ago 多少天内算最近，0表示都算。
 */
export function recent_checker(days_ago: number) {
    if (days_ago === 0) {
        return (_date: Date | null) => true
    }

    const today = new Date()
    const ago = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate() - days_ago,
    )
    return (date: Date | null) =>
        date === null || date.getTime() >= ago.getTime()
}

/**
 * 格式化日期
 *
 * 按 RFC 822，但时区不使用名称。
 *
 * 这是为了绕开 [Joda Time parser limitation](https://github.com/clj-time/clj-time/issues/97)。
 */
export function format_date(date: Date) {
    return date.toUTCString().replace(/GMT$/, '+0000')
}

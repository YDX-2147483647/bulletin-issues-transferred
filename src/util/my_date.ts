/**
 * 宽松地解析日期字符串
 * @param date 2021-6-20、1-1、……
 * @description 会忽略日期两边的字符。未标时区时采用本地时间。
 */
export function parse_date(date: string) {
    const match = date.match(/((?<year>\d+)[-/年])?(?<month>\d+)[-/月](?<day>\d+)日?((?<hour>\d+)时)?(?![-/T\d])/)
    if (match) {
        return new Date(parseInt(match.groups.year) || (new Date()).getFullYear(),
            parseInt(match.groups.month) - 1,
            parseInt(match.groups.day),
            parseInt(match.groups.hour) || 0
        )
    }

    return new Date(date)
}

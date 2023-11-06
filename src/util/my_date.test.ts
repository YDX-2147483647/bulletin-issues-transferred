import { assertEquals } from 'https://deno.land/std@0.205.0/assert/mod.ts'

import { parse_date, sort_by_date, format_date } from './my_date.ts'

function assert_date (actual: Date, expected: Date) {
    assertEquals(actual.toString(), expected.toString())
}

function assert_dates (actual: { date: Date | null }[], expected: { date: Date | null }[]) {
    assertEquals(actual.length, expected.length)
    actual.forEach((a, index) => {
        const e = expected[index]
        assertEquals(a.date?.toString() ?? a.date,
            e.date?.toString() ?? e.date)
    })
}

Deno.test('解析日期', () => {
    // '默认按本地时间解析（不按ISO）'
    assert_date(parse_date('2021-6-20'), new Date(2021, 5, 20))
    // '完整的ISO字符串还是按ISO解析'
    assert_date(parse_date('2021-12-10T20:00:00.000Z'), new Date('2021-12-10T20:00:00.000Z'))
    // '用空格分隔的ISO日期和时间'
    assert_date(parse_date('2023-03-31 17:28:49'), new Date(2023, 2, 31, 17, 28, 49))
    // '省略“年”时理解为当年'
    assert_date(parse_date('1-1'), new Date((new Date()).getFullYear(), 0, 1))
    assert_date(parse_date('08-14'), new Date((new Date()).getFullYear(), 7, 14))
    // '忽略两边的字符'
    assert_date(parse_date('[2021-12-10]'), new Date(2021, 11, 10))
    // '支持用“-”或“/”分隔'
    assert_date(parse_date('1935/12/09'), new Date(1935, 11, 9))
    // '可以带“年”“月”“日”'
    assert_date(parse_date('1921年7月23日'), new Date(1921, 6, 23))
    // '可以有小时'
    assert_date(parse_date('2021年12月27日21时'), new Date(2021, 11, 27, 21))
})

Deno.test('排序日期', () => {
    const [a, b, c] = ['2020-01-01', '2022-02-22', '2022-02-23']
        .map(d => new Date(d))

    // '都有日期时可以排序'
    assert_dates([{ date: b }, { date: a }, { date: c }].sort(sort_by_date), [{ date: c }, { date: b }, { date: a }])

    // '日期未知的压到最后'
    assert_dates([{ date: b }, { date: null }, { date: a }, { date: c }, { date: null }].sort(sort_by_date), [{ date: c }, { date: b }, { date: a }, { date: null }, { date: null }])
})

Deno.test('格式化日期', () => {
    // '不含“GMT”'
    assertEquals(format_date(new Date(2021, 5, 20)), 'Sat, 19 Jun 2021 16:00:00 +0000')
})

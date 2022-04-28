import { assert } from "chai"
import { describe, it } from "mocha"

import { parse_date, sort_by_date } from "./my_date.js"

function assert_date(actual: Date, expected: Date) {
    assert.equal(actual.toString(), expected.toString())
}

function assert_dates(actual: { date: Date | null }[], expected: { date: Date | null }[]) {
    assert.equal(actual.length, expected.length)
    actual.forEach((a, index) => {
        const e = expected[index]
        assert.equal(a.date?.toString() ?? a.date,
            e.date?.toString() ?? e.date)
    })
}


describe("解析日期", () => {
    it("默认按本地时间解析（不按ISO）", () => {
        assert_date(parse_date('2021-6-20'), new Date(2021, 5, 20))
    })
    it("完整的ISO字符串还是按ISO解析", () => {
        assert_date(parse_date('2021-12-10T20:00:00.000Z'), new Date('2021-12-10T20:00:00.000Z'))
    })
    it("省略“年”时理解为当年", () => {
        assert_date(parse_date('1-1'), new Date((new Date()).getFullYear(), 0, 1))
    })
    it('忽略两边的字符', () => {
        assert_date(parse_date('[2021-12-10]'), new Date(2021, 11, 10))
    })
    it('支持用“-”或“/”分隔', () => {
        assert_date(parse_date('1935/12/09'), new Date(1935, 11, 9))
    })
    it('可以带“年”“月”“日”', () => {
        assert_date(parse_date('1921年7月23日'), new Date(1921, 6, 23))
    })
    it('可以有小时', () => {
        assert_date(parse_date('2021年12月27日21时'), new Date(2021, 11, 27, 21))
    })
})

describe('排序日期', () => {
    it('都有日期时可以排序', () => {
        const [a, b, c] = ['2020-01-01', '2022-02-22', '2022-02-23']
            .map(d => new Date(d))

        const actual = [{ date: b }, { date: a }, { date: c }]
        actual.sort(sort_by_date)

        assert_dates(actual, [{ date: c }, { date: b }, { date: a }])
    })
    it('日期未知的压到最后', () => {
        const [a, b, c] = ['2020-01-01', '2022-02-22', '2022-02-23']
            .map(d => new Date(d))

        const actual = [{ date: b }, { date: null }, { date: a }, { date: c }, { date: null }]
        actual.sort(sort_by_date)

        assert_dates(actual, [{ date: c }, { date: b }, { date: a }, { date: null }, { date: null }])
    })
})

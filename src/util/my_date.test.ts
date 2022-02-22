import { assert } from "chai"
import { describe, it } from "mocha"
import { parse_date } from "./my_date.js"

function assert_date(a: Date, b: Date) {
    assert.equal(a.toString(), b.toString())
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

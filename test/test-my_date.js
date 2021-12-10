import { assert } from "chai"
import { describe, it } from "mocha"
import { parse_date } from "../src/lib/my_date.js"

/**
 * 
 * @param {Date} a 
 * @param {Date} b 
 */
function assert_date(a, b) {
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
})

import { assert } from 'chai'
import { describe, it } from 'mocha'

import { normalize } from './normalize.js'

function assert_normalize (raw: string, expected: string) {
    assert.equal(normalize(raw), expected)
}

describe('重整标题', () => {
    it('保持完整标题', () => {
        assert_normalize(
            '2023年北京市成人高校招生录取信息与分数线查询',
            '2023年北京市成人高校招生录取信息与分数线查询',
        )
    })
    it('修正截断标题的省略号', () => {
        assert_normalize(
            '【通知】明德书院关于2023年社会捐助类奖助学金（部分）评选工...',
            '【通知】明德书院关于2023年社会捐助类奖助学金（部分）评选工……',
        )
    })
    it('重整残余特殊字符的标题', () => {
        assert_normalize(
            '北理工宇航学院2024年接收优秀应届本科毕业生推荐免试研究生&#...',
            '北理工宇航学院2024年接收优秀应届本科毕业生推荐免试研究生……',
        )
        assert_normalize(
            '光电学院2024年接收优秀应届本科毕业生推荐免试研究生（含本直博生ÿ...',
            '光电学院2024年接收优秀应届本科毕业生推荐免试研究生（含本直博生……',
        )
        assert_normalize(
            '北京理工大学管理与经济学院2024年接收优秀应届本科毕业生推荐免试攻读研究生（含本直博生\u000f...',
            '北京理工大学管理与经济学院2024年接收优秀应届本科毕业生推荐免试攻读研究生（含本直博生……',
        )
        assert_normalize(
            '关于2023年社会捐助类奖助学金（部分࿰...',
            '关于2023年社会捐助类奖助学金（部分……',
        )
    })
})

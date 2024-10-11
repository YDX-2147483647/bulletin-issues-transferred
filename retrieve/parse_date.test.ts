import { assertEquals } from '@std/assert'

import { parse_date } from './parse_date.ts'

function assert_date(actual: Date, expected: Date) {
  assertEquals(actual.toString(), expected.toString())
}

Deno.test('解析日期', () => {
  // '默认按本地时间解析（不按ISO）'
  assert_date(parse_date('2021-6-20'), new Date(2021, 5, 20))
  // '完整的ISO字符串还是按ISO解析'
  assert_date(
    parse_date('2021-12-10T20:00:00.000Z'),
    new Date('2021-12-10T20:00:00.000Z'),
  )
  // '用空格分隔的ISO日期和时间'
  assert_date(
    parse_date('2023-03-31 17:28:49'),
    new Date(2023, 2, 31, 17, 28, 49),
  )
  // '省略“年”时理解为当年'
  assert_date(parse_date('1-1'), new Date((new Date()).getFullYear(), 0, 1))
  assert_date(
    parse_date('08-14'),
    new Date((new Date()).getFullYear(), 7, 14),
  )
  // '忽略两边的字符'
  assert_date(parse_date('[2021-12-10]'), new Date(2021, 11, 10))
  // '支持用“-”或“/”分隔'
  assert_date(parse_date('1935/12/09'), new Date(1935, 11, 9))
  // '可以带“年”“月”“日”'
  assert_date(parse_date('1921年7月23日'), new Date(1921, 6, 23))
  // '可以有小时'
  assert_date(parse_date('2021年12月27日21时'), new Date(2021, 11, 27, 21))
})

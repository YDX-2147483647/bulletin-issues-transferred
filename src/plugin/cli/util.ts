import chalk from 'npm:chalk'
import type { Notice } from '../../core/index.ts'

/**
 * 打印一系列通知
 * @param notices
 * @param options 选项
 * @param options.max 打印出来的通知的最大数量，0 表示无限制。
 * @param options.remark_if_overflow 通知太多而未全部打印时是否提示。
 */

export function print_notices(
    notices: Notice[],
    { max = 5, remark_if_overflow = true } = {},
) {
    console.log(
        notices.slice(0, max || undefined)
            .map((notice, index) => {
                const rows = notice.to_human_readable_rows()
                return [
                    chalk.underline(String(index + 1).padStart(2, ' ')) +
                    `  ${rows[0]}`,
                    ...rows.slice(1).map((row) => `    ${row}`),
                ].join('\n')
            })
            .join('\n\n'),
    )

    if (max !== 0 && remark_if_overflow && notices.length > max) {
        console.log(
            '\n' + chalk.underline('……') +
                `  另外还有${notices.length - max}项通知未显示。`,
        )
    }
}

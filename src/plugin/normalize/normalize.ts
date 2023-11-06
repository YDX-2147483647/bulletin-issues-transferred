/**
 * 重整不完整的文字
 * @param text 原始文字
 * @returns 重整化的文字
 */
export function normalize(text: string) {
    // 保留完整标题
    if (!text.endsWith('...')) {
        return text
    }

    return text.replace(/[^A-Za-z\u4E00-\u9FFF]*\.{3}$/, '……')
}

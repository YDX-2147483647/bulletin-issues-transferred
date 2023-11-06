/**
 * @param password 原始密码
 * @param salt {@link Preparation}中的`salt`
 * @returns 加密后的密码
 *
 * 在原网站中，后端只接收加密后的密码，前端匿名，因此有这一步骤。
 */
export function encryptPassword (password: string, salt: string): string

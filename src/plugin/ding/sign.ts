/**
 * 修改自 DingTalk-Robot-Sender
 * @see https://github.com/x-cold/dingtalk-robot/blob/master/lib/sign.js
 */

import crypto from 'crypto'

export default (secret: string, content: string) => {
    const str = crypto.createHmac('sha256', secret)
        .update(content)
        .digest()
        .toString('base64')
    return encodeURIComponent(str)
}

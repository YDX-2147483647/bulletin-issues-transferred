/**
 * 修改自 DingTalk-Robot-Sender
 * @see https://github.com/x-cold/dingtalk-robot/blob/master/lib/bot.js
 */

import sign from './sign.ts'

/* spell-checker: words msgtype */

/**
 * 钉钉机器人
 *
 * @see https://open.dingtalk.com/document/group/robot-overview
 */
class ChatBot {
    webhook: string
    secret?: string

    /**
     * 机器人工厂，所有的消息推送项目都会调用 this.webhook 接口进行发送
     *
     * @param options.webhook 完整的接口地址，含 access token，可用`base_url`和`access_token`替代
     * @param options.base_url 接口地址，不含 access token
     */
    constructor(
        options:
            & {
                secret?: string
            }
            & ({
                webhook: string
                base_url?: never
                access_token?: never
            } | {
                base_url: string
                access_token: string
                webhook?: never
            }),
    ) {
        if (!options.webhook && !(options.access_token && options.base_url)) {
            throw new Error('Lack for arguments!')
        }
        // 优先使用 options.webhook
        // 次之将由 options.baseUrl 和 options.accessToken 组合成一个 webhook 地址
        this.webhook = options.webhook ||
            `${options.base_url}?access_token=${options.access_token}`
        this.secret = options.secret
    }

    /**
     * 发送钉钉消息
     *
     * @param content 发动的消息对象
     */
    send(content: object): Promise<Response> {
        let signStr = ''
        if (this.secret) {
            const timestamp = Date.now()
            signStr = '&timestamp=' + timestamp + '&sign=' +
                sign(this.secret, timestamp + '\n' + this.secret)
        }
        return fetch(this.webhook + signStr, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(content),
        })
    }

    /**
     * 发送纯文本消息，支持@群内成员
     *
     * @param content 消息内容
     * @param at 群内@成员的手机号
     * @return
     */
    text(content: string, at?: object): Promise<Response> {
        return this.send({
            msgtype: 'text',
            text: {
                content,
            },
            at,
        })
    }

    /**
     * 发送单个图文链接
     *
     * @param {String} link.title 标题
     * @param {String} link.text 消息内容
     * @param {String} link.messageUrl 跳转的Url
     * @param {String} link.picUrl 图片的链接
     * @return {Promise}
     */
    link(
        link: {
            title: string
            text: string
            messageUrl: string
            picUrl: string
        },
    ): Promise<Response> {
        return this.send({
            msgtype: 'link',
            link,
        })
    }

    /**
     * 发送Markdown消息
     *
     * @param {String} title 标题
     * @param {String} text 消息内容(支持Markdown)
     * @return {Promise}
     */
    markdown(title: string, text: string, at?: object): Promise<Response> {
        return this.send({
            msgtype: 'markdown',
            markdown: {
                title,
                text,
            },
            at,
        })
    }

    /**
     * 发送actionCard(动作卡片)
     * Ps: 支持多个按钮，支持Markdown
     *
     * @param {String} card.title 标题
     * @param {String} card.text 消息内容
     * @param {String} card.btnOrientation 按钮排列的方向(0竖直，1横向，默认为0)
     * @param {String} card.btns.title 某个按钮标题
     * @param {String} card.btns.actionURL 某个按钮链接
     * @return {Promise}
     */
    actionCard(
        card: {
            title: string
            text: string
            btnOrientation: string
            btns: { title: string; actionURL: string }
            hideAvatar?: number
        },
    ): Promise<Response> {
        return this.send({
            msgtype: 'actionCard',
            actionCard: {
                title: card.title,
                text: card.text,
                hideAvatar: card.hideAvatar || 1,
                btnOrientation: card.btnOrientation || 0,
                btns: card.btns || [],
            },
        })
    }

    /**
     * 发送feedCard，支持多图文链接
     * Ps: links可包含多个link，建议不要超过4个
     *
     * @param {String} link.title 标题
     * @param {String} link.messageURL 跳转的Url
     * @param {String} link.picURL 图片的链接
     * @return {Promise}
     */
    feedCard(
        links: { title: string; messageURL: string; picURL: string }[],
    ): Promise<Response> {
        return this.send({
            msgtype: 'feedCard',
            feedCard: {
                links,
            },
        })
    }
}

export default ChatBot

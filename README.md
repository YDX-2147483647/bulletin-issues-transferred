# Bulletin Issues Transferred

![version](https://img.shields.io/github/package-json/v/YDX-2147483647/bulletin-issues-transferred)
[![RSS Valid](https://img.shields.io/badge/RSS-Valid-orange?logo=rss)](https://validator.w3.org/feed/check.cgi?url=https%3A%2F%2Fhaobit.top%2Fdev%2Ffeed.rss)
[![rssto.email](https://img.shields.io/badge/邮件-rssto.email-pink?logo=maildotru)](https://rssto.email?url=https://haobit.top/dev/feed.rss)
[![QQ群 757113685](https://img.shields.io/badge/QQ群-757113685-0852d6?logo=tencentqq)](https://jq.qq.com/?_wv=1027&k=j13nOAhr)
![Updated](https://img.shields.io/endpoint?url=https%3A%2F%2Fhaobit.top%2Fdev%2Fbadge)

BulletinIT 旨在汇总 BIT 各种网站的通知。

```shell
# 第一次使用前需要先安装包
npm install
# 然后编译 TypeScript
npm run build

# 日常使用（效果见下）
npm run update
```

## 能干什么？

日常使用时，`npm run update`会在控制台输出类似这样的内容。

```
> bulletin-issues-transferred@2.0.0 update
> node dist/plugin/cli/examples/cli.js

抓取通知 ████████████████████████████████████████ 100% | 25/25 | 已用2s，预计还需0s
未发现新通知。
 1  留学生｜2022北京理工大学国际学生招生简章
    https://isc.bit.edu.cn/eventsnotices/dd3551f3e64646b497d9f6288d1bb82b.htm
    2022/8/8 21:22:13

 2  留学生｜2022 BIT ACCP Summer Session Application Opens 2022年北京理工大学学术学分课程暑期项目招生简章
    https://isc.bit.edu.cn/eventsnotices/65e5e36535e24b3aae7c03d8ec95d7f6.htm
    2022/8/8 21:22:13

 3  留学生｜2022 BIT ACCP December Session Application Opens 2022年12月北京理工大学学术学分课程招生简章
    https://isc.bit.edu.cn/eventsnotices/fb526c44d11a41d2846132448fa46687.htm
    2022/8/8 21:22:13
以上是最新的3项通知。
```

以往信息存储在`output/notices.json`中。

- `npm run update`

  更新通知。

- `npm run update-proxy`

  使用代理更新通知。

  [YDX-2147483647/virtual-BIT-network: BIT WebVPN 登录与转换 (github.com)](https://github.com/YDX-2147483647/virtual-BIT-network)

  需要配置统一身份认证的秘密信息，请参考`config/proxy.secrets.schema.json`。

- `npm run update-ding`

  更新通知，然后向 i 北理群发送新通知。

  需要配置钉钉机器人的秘密信息，请参考`config/ding.secrets.schema.json`。

- `npm run update-rss`

  更新通知，并生成 RSS。

- `npm run update-server`

  proxy + rss，可用于服务器上的 crontab。

  我们已部署了一个，可在 [HaoBIT](https://haobit.top/dev/site/notice/) 查看，例如 [RSS](http://haobit.top/dev/feed.rss)。

- `npm run update-server-ding`

  server + ding，可用于服务器上的 crontab。

## 如何贡献？

请注意，这个项目报了2021-2022学年的校创及2022年的北京市市创（服务器钱就来源于此），大家在这个仓库的贡献可能会被答辩老师算在我们头上。

### 添加别的通知来源

注：如果你不知道怎么提拉取请求（pull request），不妨直接新建[议题（issue）](https://github.com/YDX-2147483647/bulletin-issues-transferred/issues/new/choose)。

-   写明名称、网址、同学该如何找到它等等。

    这些内容写在`config/sources_by_selectors.json`中，详细规则见同文件夹的`*.schema.json`。

    其实也不用太研究那个 JSON Schema，只要看一下现有的`sources_by_selectors.json`，结合 VS Code 的语法提示，照猫画虎就行了。

-   描述如何从这个来源获取通知。

    目前有两类方法：

    -   先获取通知列表的静态网页，然后用 CSS 选择器从中提取信息。

        CSS 选择器写在`config/sources_by_selectors.json`中。

    -   利用学校的 API。

        在`src/core/sources/special.ts`中的`raw_sources: SourceSpecialInterface[]`里。

### 移植到别的学校

只需要写新的`config/sources_by_selectors.json`和`src/core/sources/special.ts`即可。

### 编程

[DEVELOPMENT.md](./DEVELOPMENT.md) 描述了一些思路、细节。另外`npm run doc`可以生成文档。

## 这合法吗？

-   绝对不涉密

    > 上网不涉密，涉密不上网。

    我们只获取无需登录就能访问到的通知。一般人用搜索引擎都能找到这些页面，只是比较麻烦。

-   不侵犯版权

    （且不论通知有没有版权）我们只获取通知的标题，并且会给出原链接。

-   基本不会给学校服务器造成压力

    如[前](#添加别的通知来源)所述，获取通知不会频繁访问学校网站，一个普通人在学校网上乱点造成的压力可能都比这个项目的大。

    另外，这个项目也许会方便一些同学找通知，避免在学校网上乱翻，从而可能减小学校服务器的压力。

-   原理基于公开内容

    CSS 选择器只是描述学校网页，API 是搜索学校网页源代码得到的。这些内容都在 Web 前端，是公开的。

# Bulletin Issues Transferred

BulletinIT 旨在汇总 BIT 各种网站的通知。

```powershell
# 第一次使用前需要先安装包
npm init
# 然后编译 TypeScript
npm run build

# 日常使用（效果见下）
npm run update-data

# 如果你想看看代码，可以生成文档
npm run doc
```

## 能干什么？

日常使用时，`npm run update-data`会在控制台输出类似这样的内容。

```
> bulletin-issues-transferred@1.2.3 update-data
> node dist/update_notices.js

🛈  发现25个通知来源。
🛈  从“数学实验”获取到5项通知。
🛈  从“睿信”获取到20项通知。
🛈  从“经管”获取到20项通知。
🛈  从“求是”获取到20项通知。
……
🛈  从“网信”获取到20项通知。
共筛选出271项通知。
未发现新通知。
 1  第二课堂｜【思】精工书院“精•沙龙”系列活动第二十六期——数字时代的技术与经济
    http://dekt.bit.edu.cn/portal/CourseView.jsp?course_id=661175968422
    2021/12/24 上午12:00:00

 2  第二课堂｜【文】精工书院“精•沙龙”系列活动第二十五期——礼仪文化与形象塑造
    http://dekt.bit.edu.cn/portal/CourseView.jsp?course_id=422231297409
    2021/12/22 上午12:00:00

……

 5  研究生｜关于公布2021年度北京理工大学研究生教育培养综合改革教研教改一般项目认定结果的通知
    https://grd.bit.edu.cn/pygz/jyjg/tzgg_jyjg/18c31d7e346f431ab836544cf8510e51.htm
    2021/12/20 上午12:00:00
以上是最新的5项通知。
```

如果你看一下`data/`文件夹，会发现以往信息存储在`notices.json`中。这个文件夹里还有用通知生成的`feed.rss`（但从未测试过）。

## 如何贡献？

### 添加别的通知来源

-   写明名称、网址、同学该如何找到它等等。

    这些内容写在`config/notice_sources.json`中，详细规则见同文件夹的`*.schema.json`。

    其实也不用太研究那个 JSON Schema，只要看一下现有的`notice_sources.json`，结合 VS Code 的语法提示，照猫画虎就行了。

-   描述如何从这个来源获取通知。

    目前有两类方法：

    -   先获取通知列表的静态网页，然后用 CSS 选择器从中提取信息。

        CSS 选择器写在`config/notice_sources.json`中。

    -   利用学校的 API。

        在`src/sources_special.ts`中的`specials`里实现虚基类`Source`的`fetch_notice()`方法。

### 移植到别的学校

只需要写新的`config/notice_sources.json`和`src/sources_special.ts`即可。

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

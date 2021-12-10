import fetch from "node-fetch"

fetch('https://dzb.bit.edu.cn/cms/web/notify/search?page=1&status=7&rows=20&order=1&sortFiled=publishDate', { method: "post" })
    .then(res => res.json())
    .then((reply: { object: { notifyType: string, articleID: string, title: string }[] }) => reply.object)
    .then(rows => rows.map(
        ({ notifyType, articleID, title }) => ({
            type: notifyType.replace('通知', ''),
            link: `https://dzb.bit.edu.cn/cms/web/search/download.jsp?id=${articleID}`,
            title,
            date: null
        })
    ))
    .then((data) => {
        console.log(data)
        console.log(data.length)
    })

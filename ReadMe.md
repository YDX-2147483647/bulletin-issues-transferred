# Bulletin Issues Transferred

BulletinIT旨在汇总BIT各种~~乱七八糟~~网站的通知。

## 已知的问题

### 不支持动态加载的通知

- [党政部](https://dzb.bit.edu.cn/bftz/index.htm)的通知是靠脚本加载的。代码直接写在HTML里，类似下面这样。（API提供的信息并未都显示出来，比如通知类型）

  ```javascript
  $.post('https://dzb.bit.edu.cn/cms/web/notify/search',
    { 'page': 1, 'status': 7, 'rows': 15, 'order': 1, 'sortFiled': 'publishDate' },
    console.log)
  ```

- [数学实验](http://mec.bit.edu.cn/infos/index.html)甚至使用了Vue。

  // `myfun.js`里还有runoob的链接……

  ```html
  <span class="txt">新闻公告</span>
  <span class="notes">
    <span v-if="keys">检索“{{keys}}”,</span>
    共{{totalpage}}页  {{total}}条 每页{{pagesize}}条
  </span>
  ```

  ```javascript
  apiget("/pcmd/ajax.php?act=getmanage_nologin&w=新闻公告&keys=&p=1&size=10&by=undefined&order=undefined")
  ```
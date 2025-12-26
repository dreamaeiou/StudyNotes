# 浏览器

1. 浏览器的渲染原理
   HTML 解析、样式计算、布局、分层、生成绘制指令、分块、光栅化、绘制
   - 在网络传输中，计算机以 01 字节数据传输，浏览器拿到字节流，转化为字符串
     在词法分析，给字符串标记化，分析出 _DOM_ 节点，构建 _DOM_ 树
     为了提高解析效率，浏览器启动预解析线程，当主线程遇到 _link_，预解析线程快速浏览，在网络线程中，下载外部 _css/js_，在回到预解析线程解析，当 _DOM_ 树构建完，而 _CSSOM_ 树还没，主线程等待 _CSSOM_，两棵树包含：浏览器的默认样式、内部样式、外部样式、行内样式，元素大小，尺寸等，如果主线程解析到 _script_ 位置，会停止解析 _HTML_，转而等待 _JS_ 文件下载好，并将全局代码解析执行完成后，才能继续解析 _HTML_。
   - **样式计算**，主线程遍历 DOM 树，依次为每个节点计算最终样式,这个过程 red 变为 rgb,em 变 px,此时合并成*rendertree*
   - **布局**，遍历*rendertree*，根据这个节点的计算样式计算出*layout tree*，每个节点具有在页面上 x，y 的坐标以及盒子大小。有一点是*render*树有*display*属性，*layout tree*会不存在，*render tree*调用伪元素选择器，不存在这些伪元素节点，但它们拥有几何信息，所以会生成到*layout tree*中。
   - **分层**，分层的好处在于，将来某一个层改变后，仅会对该层进行后续处理，从而提升效率。为了确定哪些元素需要放置在哪一层，主线程需要遍历整颗布局树来创建一棵层次树（_Layer Tree_），滚动条、堆叠上下文、_transform_、_opacity_ 等样式都会或多或少的影响分层结果，也可以通过使用 _will-change_ 属性来告诉浏览器对其分层。
   - **生成绘制指令**，主线程会为每个层单独产生绘制指令集，用于描述这一层的内容该如何画出来。这一步只是生成诸如上面代码的这种绘制指令集，还没有开始执行这些指令。生成绘制指令集后，渲染主线程的工程就暂时告一段落，接下来主线程将每个图层的绘制信息提交给合成线程，剩余工作将由合成线程完成。
   - **分块**，合成线程首先对每个图层进行分块，将其划分为更多的小区域，它会从线程池中拿取多个线程来完成分块工作。
   - **光栅化** ，分块完成后，进入**光栅化**阶段。所谓光栅化，就是将每个块变成位图。光栅化的操作，并不由合成线程来做，而是会由合成线程将块信息交给 _GPU_ 进程，以极高的速度完成光栅化。
   - **绘制**，当所有的图块都被栅格化后，合成线程会拿到每个层、每个块的位图，从而生成一个个「指引（quad）」信息。指引会标识出每个位图应该画到屏幕的哪个位置，以及会考虑到旋转、缩放等变形。变形发生在合成线程，与渲染主线程无关，这就是 _transform_ 效率高的本质原因。

```js
// 伪代码逻辑
async function 页面渲染流程() {
  const dom = 解析HTML(); // 不阻塞，继续解析
  const cssom = await 加载并解析CSS(); // 异步进行
  遇见js会阻塞渲染;
  故script放在body底部，使用async、defer、preload、prefetch
  // 在这里等待！
  // 必须等 CSSOM 准备好，才能继续
  const renderTree = 合并DOM和CSSOM(dom, cssom);
  布局(renderTree);
  绘制();
}
```

2. 资源提示关键词

```js
正常情况下，渲染主线程遇见js，等待js下载，在执行
<script async src="script.js"></script>
这个是同步下载，等待执行
<script defer src="myscript.js"></script>
这个是同步下载，解析完dom在执行

preload
<link rel="stylesheet" href="style2.css">
<script src="main2.js"></script>

<link rel="preload" href="style1.css" as="style">
<link rel="preload" href="main1.js" as="script">
preload顾名思义就是一种预加载的方式，它通过声明向浏览器声明一个需要提前加载的资源，当资源真正被使用的时候立即执行，就无需等待网络的消耗。

prefetch
<link rel="prefetch" href="/path/to/style.css" as="style">
*prefetch* 是一种利用浏览器的空闲时间加载页面将来可能用到的资源的一种机制，通常可以用于加载非首页的其他页面所需要的资源，以便加快后续页面的首屏速度。
```

3. 浏览器组成
   一个 _Web_ 浏览器中，主要组件有：

   - 用户界面（_user interface_）
   <!-- 浏览器窗口部件，比如地址栏、前进后退按钮、书签、顶部菜单等 -->
   - 浏览器引擎（_browser engine_）
   <!-- 用户在用户界面和渲染引擎中传递指令 -->
   - 渲染引擎（_rendering engine_）
   <!-- 负责解析 *HTML*、*CSS*，并将解析的内容显示到屏幕上。我们平时说的浏览器内核就是指这部分。 -->
   - 网络（_networking_）
   <!-- 用户网络调用，比如发送 *http* 请求 -->
   - _JS_ 解释器（_JavaScript interpreter_）
   <!-- 解释执行 *JS* 代码。我们平时说的 *JS* 引擎就是指这部分 -->
   - 用户界面后端（_UI backend_）
   <!-- 用于绘制基本的窗口小部件，比如下拉列表、文本框、按钮等，向上提供公开的接口，向下调用操作系统的用户界面。 -->
   - 数据存储（_data storage_）
     <!-- 用户保存数据到磁盘中。比如 *cookie、localstorage* 等都是使用的这部分功能。 -->
     ![image-20211126131413497](https://xiejie-typora.oss-cn-chengdu.aliyuncs.com/2021-11-26-051413.png)

4. 浏览器离线缓存

- WebSQL(已经废除)

```js
<div id="status"></div>;
let stuName = "张三";
let age = 18;
var db = openDatabase("mydb", "1.0", "Test DB", 2 * 1024 * 1024);
//name,version,describle,size
<!-- executeSql(sqlStatement, arguments, callback, errorCallback) -->
db.transaction(function (tx) {
  tx.executeSql("CREATE TABLE IF NOT EXISTS STU (id unique, name, age)");
  tx.executeSql('INSERT INTO STU (id, name, age) VALUES (1, "张三", 18)');
  tx.executeSql("INSERT INTO STU (id, name, age) VALUES (3, ?, ?)", [
    stuName,
    stuAge,
  ]);
});
db.transaction('SELECT * FROM STU', [], function (tx, results){
 //TODO
})
```

- indexDB
  数据库、对象存储（在 onupgradeneeded 中创建）、索引，事务
  允许存储大量结构化数据，并提供高性能的查询能力
  ![indexDB的使用](indexDB.js)

- local/sessionStorage
  local:所有标签页，永久存储(生命周期)，所有标签共享(数据共享)
  session:仅当前标签页，标签页/会话结束，仅当前标签页

- cookie

5. 浏览器缓存
   浏览器每次请求，都会先在浏览器缓存中查找该请求的结果以及缓存标识，浏览器每次拿到返回的请求结果都会将该结果和缓存标识存入浏览器缓存中

- 缓存位置

1. _Service Worker_
   它可以让我们自由控制缓存哪些文件、如何匹配缓存、如何读取缓存，并且缓存是持续性的。
   先注册 _Service Worker_，然后监听到 _install_ 事件以后就可以缓存需要的文件，那么在下次用户访问的时候就可以通过拦截请求的方式查询是否存在缓存，存在缓存的话就可以直接读取缓存文件，否则就去请求数据。
   ![service worker](./cache/)
2. _Memory Cache_
   浏览器自行控制
   > 1. 打开网页，加载了 logo.png
   > 2. 滚动页面，又看到了 logo.png
   > 3. 第二次看到时 → 瞬间加载！（Memory Cache 起作用）
   > 4. webpack 配置代码分割成多个<1MB,更容易缓存 0
3. _Disk Cache_
   _Disk Cache_ 也就是存储在硬盘中的缓存，读取速度慢点，但是什么都能存储到磁盘中，比之 _Memory Cache_ 胜在容量和存储时效性上。
   它会根据 _HTTP Herder_ 中的字段判断哪些资源需要缓存，哪些资源可以不请求直接使用，哪些资源已经过期需要重新请求。
4. _Push Cache_

- 缓存类型
  需要注意的是，无论是强制缓存还是协商缓存，都是属于 _Disk Cache_ 或者叫做 _HTTP Cache_ 里面的一种。

1. 强缓存
   当客户端请求后，会先访问缓存数据库看缓存是否存在。如果存在则直接返回；不存在则请求真的服务器，响应后再写入缓存数据库。可以造成强制缓存的字段是 _Cache-control_ 和 _Expires_。
2. 协商缓存
   当强制缓存失效（超过规定时间）时，就需要使用协商缓存，由服务器决定缓存内容是否失效。
   流程上说，浏览器先请求缓存数据库，返回一个缓存标识。之后浏览器拿这个标识和服务器通讯。如果缓存未失效，则返回 _HTTP_ 状态码 _304_ 表示继续使用，于是客户端继续使用缓存;

#### _Last-Modified & If-Modified-Since_

1. 服务器通过 _Last-Modified_ 字段告知客户端，资源最后一次被修改的时间，例如：
   Last-Modified: Mon, 10 Nov 2018 09:10:11 GMT
2. 浏览器将这个值和内容一起记录在缓存数据库中。
3. 下一次请求相同资源时时，浏览器从自己的缓存中找出“不确定是否过期的”缓存。因此在请求头中将上次的 _Last-Modified_ 的值写入到请求头的 _If-Modified-Since_ 字段
4. 服务器会将 _If-Modified-Since_ 的值与 _Last-Modified_ 字段进行对比。如果相等，则表示未修改，响应 _304_；反之，则表示修改了，响应 _200_ 状态码，并返回数据。

#### Etag & If-None-Match

Etag 在于 hash 值的改变

```js
// 伪代码 - 服务器端
function 处理请求(request) {
  // 1. 获取数据
  data = 从数据库获取数据()

  // 2. 生成 ETag（数据的唯一标识）
  etag = 生成ETag(data)

  // 3. 检查客户端是否缓存了最新版本
  if (request.headers['If-None-Match'] == etag) {
    // 缓存有效，返回 304（不需要返回数据）
    return 响应(状态码: 304, 不需要数据)
  }

  // 4. 缓存无效，返回新数据和 ETag
  return 响应(
    状态码: 200,
    数据: data,
    头信息: {
      'ETag': etag,
      'Cache-Control': 'no-cache'  // 必须验证
    }
  )
}
```

```js
// 伪代码 - 浏览器自动做
// 第一次请求
GET /api/data
服务器返回: 200 OK + ETag: "abc123"

// 浏览器自动把 ETag 存起来
// 第二次请求
GET /api/data
自动添加请求头: If-None-Match: "abc123"

// 如果数据没变
服务器返回: 304 Not Modified
浏览器: 用缓存的数据

// 如果数据变了
服务器返回: 200 OK + 新数据 + 新ETag
浏览器: 用新数据，更新ETag
```

```js
第一次请求:
客户端 → GET /api/data
         ↓
服务器 → 200 OK + ETag: "abc123" + 数据{...}
         ↓
客户端 → 保存数据和ETag

第二次请求:
客户端 → GET /api/data + 请求头: If-None-Match: "abc123"
         ↓
服务器 → 检查数据是否变化
   ├─ 数据没变 → 返回 304 Not Modified
   └─ 数据变了 → 返回 200 OK + 新ETag + 新数据
         ↓
客户端 → 如果是304，用缓存数据
         ↓
客户端 → 如果是200，用新数据，更新ETag
```

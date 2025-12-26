# you should do

- 数据类型，存储栈堆

- dom 的 crud，nextSlibing。。。？？

- bom 的 window，navigator，screen，history？？？？？
- ==与===区别
- typeof 与 instanceof 区别？
- 原型，原型链

- 作用域链，全局，函数，块级？

- this？？？？ **执行的时候确认**
- 手写 new，用 apply？ **yes**
- bind，call，apply 区别,call 和 apply 临时改变 this 指向，立即执行，bind 不执行，永久改变，return 函数？
- 实现 bind，修改 this 指向，动态传递参数，兼容 new **yes**

## ???

- **12** 执行上下文与执行栈，全局（window 对象），函数（调用创建），eval 执行上下文
  生命周期，创建（确认 this,词法环境，变量环境），执行（开始分配值，找不到为 undefined），回收 ？？？？？
  执行栈，执行中，入栈，执行完出栈

- **13** 事件模型，捕获和冒泡,dom 是树结构，按某种顺序进行交互，标准，原始，ie 事件模型？？

- 事件代理，减少内存，动态绑定，减少重复工作

- 闭包，一个函数和它周围状态的引用绑定一起，内部函数访问外部函声明的变量
  创建私有变量，延长生命周期 ？？？
  柯里化函数，柯⾥化的⽬的在于避免频繁调⽤具有相同参数函数的同时，⼜能够轻松的重⽤ **eg**
  但不要过度使用闭包，可以用 MyObject,prototypr.getName=function(){return this.name}

- js 类型转换机制 显示和隐式 **重要 16**？？？
  Number，转化不了为 nan，parseInt('32a3') //32

- 暂时性死区 暂时性死区是指在 ES6 中，使用 let 或 const 声明的变量，在声明之前不能被访问的语法限制。这段从作用域开始到声明语句执行之间的区域就叫 TDZ，抛出 ReferenceError ？？

- **17** 深浅拷贝
  **直接赋值,Object.assign({},stu),stu2={...stu1},[1,2,3].slice(),[1,2,3].concat()**
  **手写 obj 浅拷贝,内部元素为基本类型拷贝值，引用类型则地址,地址比较为 true**

```js
const _ = require("lodash");
const $ = require("jquery");
const obj1 = {
  a: 1,
  b: { f: { g: 1 } },
  c: [1, 2, 3],
};
const obj2 = _.cloneDepp(obj);
const obj3 = $.extend(true, {}, obj1);
const obj3 = JSON.parse(JSON.stringify(obj1)); //忽略undefined，symbol，函数
```

- 函数缓存 将函数运算结果进行缓存,闭包，柯里化 **手写函数缓存** ？？17

- 字符串的常用方法

```js
+ 或 ${} 拼接
let stringValue = "hello ";
let result = stringValue.concat("world");
let stringValue = "hello world";

console.log(stringValue.slice(3)); // "lo world"
console.log(stringValue.substring(3)); // "lo world

trim(),repeat(number),toLowerCase()

let message='abcd';
message.charAt(2);//c
message.indexOf('c')//2
startWith()、includes();

let str = "12+23+34"
let arr = str.split("+") // [12,23,34]
let text = "cat, bat, sat, fat";
let pattern = /.at/;
let matches = text.match(pattern);
console.log(matches[0]); // "cat"

let text = "cat, bat, sat, fat";
let pattern = /.at/;
let matches = text.match(pattern);
console.log(matches[0]); // "cat"

let text = "cat, bat, sat, fat";
let result = text.replace("at", "ond");
console.log(result); // "cond, bat, sat, fat"
```

- 数组方法

```js
push, concat, unshift, splice（1，0）;
pop, shift, splice(1, 2)，slice(0);
indexOf('c'),includes,find
reverse,sort
join(",")
some,every,map,forEach,filter
```

- 事件循环 js 是单线程语言，js 中，任务分为同步和异步，异步中用宏任务与微任务
  微任务先发生于宏任务 ？？？？？

```js
//直接例题
async function async1() {
  console.log("async1 start"); //2
  await async2();
  console.log("async1 end"); //6
}
async function async2() {
  console.log("async2"); //3
}
console.log("script start"); //1
setTimeout(function () {
  console.log("settimeout"); //8
});
async1();
new Promise(function (resolve) {
  console.log("promise1"); //4
  resolve();
}).then(function () {
  console.log("promise2"); //7
});
console.log("script end"); //5
```

- js 本地存储
  session、cookie、localstorage、indexDB、webSQL

```js
标记⽤户与跟踪⽤户⾏为的情况，推荐使⽤ cookie
适合⻓期保存在本地的数据（令牌），推荐使⽤ localStorage
敏感账号⼀次性登录，推荐使⽤ sessionStorage
存储⼤量数据的情况、在线⽂档（富⽂本编辑器）保存编辑历史的情况，推荐使⽤ indexedDB
```

## AJAX

![ajax](./手写ajax.js)

- 防抖 debounce 和节流 throttle

1. 防抖: n 秒后在执⾏该事件，若在 n 秒内被重复触发，则重新计时
2. 节流: n 秒内只运⾏⼀次，若在 n 秒内重复触发，只有⼀次⽣效

   ⼀个经典的⽐喻:
   想象每天上班⼤厦底下的电梯。把电梯完成⼀次运送，类⽐为⼀次函数的执⾏和响应
   假设电梯有两种运⾏策略 debounce 和 throttle ，超时设定为 15 秒，不考虑容量限制
   电梯第⼀个⼈进来后，15 秒后准时运送⼀次，这是节流(搜索框搜索输⼊。只需⽤户最后⼀次输⼊完，再发送请求,⼿机号、邮箱验证输⼊检测)
   电梯第⼀个⼈进来后，等待 15 秒。如果过程中⼜有⼈进来，15 秒等待重新计时，直到 15 秒后开始运送，这是防抖(滚动加载，加载更多或滚到底部监听,搜索框，搜索联想功能)

- 如何判断一个元素是否再可视范围

```js
// 使用offset
function isInViewPortOfOne(el) {
  const viewPortHeight = window.innerHeight || document.documentElement.c;
  lientHeight || document.body.clientHeight;
  // 浏览器可视区的高度
  const offsetTop = el.offsetTop; //是元素顶部距离文档顶部的高度
  const scrollTop =
    document.documentElement.scrollTop || document.body.scrollTop;
  //浏览器滚动的距离
  return offsetTop <= scrolltOP + viewPortHright;
}
```

```js
// 使用getBoundingClientRect()
const target = document.querySelector(".target");
const clientRect = target.getBoundingClientRect();
console.log(clientRect);
// {
// bottom: 556.21875,
// height: 393.59375,
// left: 333,
// right: 1017,
// top: 162.625,
// }

top  -------
-----|     |
left |     |
      ------ |bottom
    right   |

function isInViewPort(element) {
  const viewWidth = window.innerWidth || document.documentElement.clientWidth;
  const viewHeight = window.innerHeight || document.documentElement.clientHeight;
  const { top, right, bottom, left } = element.getBoundingClientRect();
  return top >= 0 && left >= 0 && right <= viewWidth && bottom <= viewHeight;
}
```

```js
// Intersection Observer
// 1. 创建观察器
const observer = new IntersectionObserver(
  (entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        // 元素进入视窗
        console.log("元素进入视窗", entry.target);
        // 停止观察（如果需要的话）
        // observer.unobserve(entry.target);
      } else {
        // 元素离开视窗
        console.log("元素离开视窗");
      }
    });
  },
  {
    // 配置选项
    root: null, // 默认是浏览器视窗
    rootMargin: "0px", // 扩展或缩小检测区域
    threshold: 0.5, // 触发比例：0-1之间
  }
);

// 2. 开始观察
const target = document.querySelector(".target");
observer.observe(target);
```

### 图片懒加载

![](IntersectionObserver.js)

1. img.src = img.dataset.src 是什么意思？

```js
// HTML中的结构
<img data-src="real-image.jpg" src="">

// JavaScript获取
console.log(img.dataset.src);  // "real-image.jpg"
console.log(img.src);          // "" (空字符串)

// 执行这行代码
img.src = img.dataset.src;
// 等价于：
img.src = "real-image.jpg";

// 结果：浏览器会立即开始加载 real-image.jpg

```

2. data-src 和 src 的区别：
   data-src：自定义属性，浏览器不会自动加载
   src：标准属性，浏览器看到就会立即加载
   为什么不用 src 直接存储真实 URL？

```js
<!-- ❌ 错误做法： -->
<img src="real-image.jpg" class="lazy">
<!-- 问题：页面一加载，100张图片同时请求！
     用户还没滚动，就下载了所有图片
     浪费流量，页面卡顿 -->

<!-- ✅ 正确做法： -->
<img data-src="real-image.jpg" src="placeholder.gif">
<!-- 优点：只加载1张占位图
 等需要时再替换为真实图片 -->
```

3. 为什么要用 new Image()而不是直接设置 img.src？

```js
// ❌ 直接设置
img.src = img.dataset.src; // 直接修改
// 问题：如果图片很大，会阻塞主线程
// 用户会看到图片一点点加载出来，不流畅

// ✅ 预加载方案
const tempImg = new Image(); // 创建内存中的图片对象
tempImg.onload = () => {
  // 图片加载完成时的回调
  img.src = img.dataset.src; // 此时再设置到真实img
  img.classList.add("lazy-loaded"); // 添加加载完成的样式
  this.observer.unobserve(img); // 停止观察（已加载过）
};
tempImg.src = img.dataset.src; // 开始预加载

// 优点：
// 1. 不阻塞：在内存中加载，不影响页面渲染
// 2. 瞬间显示：加载完成后一次性显示，无渐入效果
// 3. 回调控制：可以添加加载完成后的动画
```

### 输入 url 地址后

1. 浏览器自动补全协议，端口
2. 自动完成 url 编码
3. 浏览器根据 url 地址查找本地缓存，根据缓存规则看是否命中缓存，若命中缓存则直接使用缓存，不再发出请求
4. DNS 解析找到服务器 IP 地址
5. 浏览器向服务器发送建立 TCP 连接申请，完成三次握手
6. 若使用 https 协议，还会进行 SSL 握手，确定是否使用 HTTP2
7. 浏览器决定附带哪些哪些 cookie 到请求头
8. 自动设置请求头，协议版本，cookie，发送 get 请求
9. 服务器接受请求，后端处理，响应给浏览器
10. 根据响应头状态码处理这一次响应，Content-Type 字段识别响应类型
11. 解析过程中生成 DOM 树、CSSOM 树，然后一边生成，一边把二者合并为渲染树（rendering tree），随后对渲染树中的每个节点计算位置和大小（reflow），最后把每个节点利用 GPU 绘制到屏幕（repaint）

### TCP 协议

5 层网络层

1. 应用层(HTTP)
2. 传输层(TCP,UDP)
3. 网络层(IP,路由器)
4. 数据链路层
5. 物理层

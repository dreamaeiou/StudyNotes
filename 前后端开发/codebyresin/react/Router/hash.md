```js
// 原生 JS 实现 Hash 路由
class HashRouter {
  constructor() {
    this.routes = {};
    this.currentUrl = "";

    // 监听 hashchange 事件
    window.addEventListener("load", () => this.refresh());
    window.addEventListener("hashchange", () => this.refresh());
  }

  // 注册路由
  route(path, callback) {
    this.routes[path] = callback || function () {};
  }

  // 刷新页面
  refresh() {
    // 获取当前 hash
    this.currentUrl = window.location.hash.slice(1) || "/";

    // 执行对应的回调函数
    if (this.routes[this.currentUrl]) {
      this.routes[this.currentUrl]();
    } else {
      // 404 处理
      console.error("路由不存在:", this.currentUrl);
    }
  }

  // 跳转到指定路径
  navigate(path) {
    window.location.hash = "#" + path;
  }

  // 替换当前路由（不添加历史记录）
  replace(path) {
    const baseUrl = window.location.href.split("#")[0];
    window.location.replace(baseUrl + "#" + path);
  }
}

// 使用示例
const router = new HashRouter();

router.route("/", () => {
  console.log("首页");
  document.getElementById("app").innerHTML = "<h1>首页</h1>";
});

router.route("/about", () => {
  console.log("关于页");
  document.getElementById("app").innerHTML = "<h1>关于我们</h1>";
});

router.route("/user/:id", () => {
  const id = router.currentUrl.split("/")[2];
  document.getElementById("app").innerHTML = `<h1>用户 ${id}</h1>`;
});

// 跳转
router.navigate("/about");
```

```js
// React Router Hash 模式
import { HashRouter as Router, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <nav>
        <Link to="/">首页</Link>
        <Link to="/about">关于</Link>
      </nav>
      <Route path="/" exact component={Home} />
      <Route path="/about" component={About} />
    </Router>
  );
}

// Vue Router Hash 模式
const router = new VueRouter({
  mode: "hash", // 使用 hash 模式
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: About },
  ],
});
```

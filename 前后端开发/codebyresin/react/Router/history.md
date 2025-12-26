# History

## 基本 api

```js
// 1. pushState: 添加历史记录
history.pushState(state, title, url);
// 例如：history.pushState({page: 1}, "title 1", "/page1");

// 2. replaceState: 替换当前历史记录
history.replaceState(state, title, url);

// 3. 监听 popstate 事件（前进/后退）
window.addEventListener("popstate", (event) => {
  console.log("位置变化:", event.state);
});

// 4. 获取当前状态
const currentState = history.state;
```

## 原生 JS 实现 History 路由

```js
class HistoryRouter {
  constructor() {
    this.routes = {};

    // 监听 popstate 事件（前进/后退）
    window.addEventListener("popstate", (e) => {
      this.loadRoute();
    });

    // 监听链接点击（阻止默认行为，使用 pushState）
    document.addEventListener("click", (e) => {
      if (e.target.tagName === "A" && e.target.getAttribute("href")) {
        e.preventDefault();
        const path = e.target.getAttribute("href");
        this.navigate(path);
      }
    });

    // 初始加载
    window.addEventListener("load", () => this.loadRoute());
  }

  // 注册路由
  route(path, callback) {
    this.routes[path] = callback || function () {};
  }

  // 加载当前路由
  loadRoute() {
    const path = window.location.pathname || "/";

    // 解析路径参数（简单版）
    const matchedRoute = Object.keys(this.routes).find((route) => {
      // 简单路径匹配，实际应该用正则表达式
      return route === path;
    });

    if (matchedRoute && this.routes[matchedRoute]) {
      this.routes[matchedRoute]();
    } else {
      // 404 处理
      this.routes["/404"]
        ? this.routes["/404"]()
        : console.error("路由不存在:", path);
    }
  }

  // 跳转到指定路径
  navigate(path, state = {}) {
    history.pushState(state, "", path);
    this.loadRoute();
  }

  // 替换当前路由
  replace(path, state = {}) {
    history.replaceState(state, "", path);
    this.loadRoute();
  }

  // 前进/后退
  go(n) {
    history.go(n);
  }

  back() {
    history.back();
  }

  forward() {
    history.forward();
  }
}

// 使用示例
const router = new HistoryRouter();

router.route("/", () => {
  document.getElementById("app").innerHTML = "<h1>首页</h1>";
});

router.route("/about", () => {
  document.getElementById("app").innerHTML = "<h1>关于我们</h1>";
});

// 动态路由参数处理（简化版）
router.route("/user/:id", () => {
  const path = window.location.pathname;
  const id = path.split("/")[2];
  document.getElementById("app").innerHTML = `<h1>用户 ${id}</h1>`;
});
```

```js
// React Router History 模式
import { BrowserRouter as Router, Route, Link } from "react-router-dom";

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

// Vue Router History 模式
const router = new VueRouter({
  mode: "history", // 使用 history 模式
  routes: [
    { path: "/", component: Home },
    { path: "/about", component: About },
    { path: "*", component: NotFound }, // 404 页面
  ],
});
```

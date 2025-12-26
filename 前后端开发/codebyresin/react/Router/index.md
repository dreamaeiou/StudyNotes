# 路由配置

守卫类型
适用场景
React Router v5
React Router v6

全局守卫 ​
身份验证、日志记录
包装 BrowserRouter
包装 Routes 组件

路由守卫 ​
权限控制、数据预加载
自定义 Route 组件
包装路由元素

组件守卫 ​
离开确认、数据保存
Prompt 组件
useBlocker 钩子

异步守卫 ​
异步权限检查
在生命周期中处理
useEffect + 状态

组合守卫 ​
复杂权限逻辑
嵌套组件
组合组件或 HOC

## 路由配置对象

```js
import { lazy } from "react";
import { Navigate, type RouteObject } from "react-router-dom";

const HomePage = lazy(() => import("../views/HomePage"));
const routes = [
  {
    path: "/",
    element: <HomePage />,
    meta: {
      requiresAuth: false,
      title: "首页",
    },
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
    meta: {
      requiresAuth: true,
      roles: ["user", "admin"],
    },
    // 嵌套路由
    children: [
      {
        path: "profile",
        element: <Profile />,
        meta: { requiresAuth: true },
      },
    ],
  },
];

// 路由守卫包装器
function RouteGuard({ route }) {
  const { user } = useAuth();
  const location = useLocation();

  // 检查是否需要认证
  if (route.meta?.requiresAuth && !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 检查角色权限
  if (route.meta?.roles && user) {
    const hasRole = route.meta.roles.some((role) => user.roles.includes(role));
    if (!hasRole) {
      return <Navigate to="/unauthorized" replace />;
    }
  }

  // 设置页面标题
  if (route.meta?.title) {
    document.title = route.meta.title;
  }

  return route.element;
}
```

1. 组件式路由

```js
function App() {
  return (
    <Routes>
      {routes.map((route, index) => (
        <Route
          key={index}
          path={route.path}
          element={<RouteGuard route={route} />}
        >
          {route.children?.map((child, childIndex) => (
            <Route
              key={childIndex}
              path={child.path}
              element={<RouteGuard route={child} />}
            />
          ))}
        </Route>
      ))}
    </Routes>
  );
}
```

2. 集中配置式

```js
// App.jsx
function App() {
  return <div className="main">{useRoutes(routes)}</div>;
}
// router/index.js
const routes = [
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: "about", element: <About /> },
      {
        path: "dashboard",
        element: (
          <AuthGuard>
            <Dashboard />
          </AuthGuard>
        ),
      },
    ],
  },
];
```

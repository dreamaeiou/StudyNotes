# React 与 Vue 深度对比及 React 面试指南

## 1. React 和 Vue 的区别

### 1.1 核心设计理念

**React**

- 以组件化和虚拟 DOM 为核心
- 强调单向数据流
- 更注重视图层的渲染逻辑
- 采用函数式编程思想，鼓励使用纯函数
- 提供最小化 API，更多依赖社区生态

**Vue**

- 渐进式框架，易于上手和集成
- 结合了单向数据流和双向数据绑定
- 提供完整的解决方案（路由、状态管理等）
- 模板语法更接近原生 HTML，学习曲线平缓
- 官方提供更多内置功能，减少配置

### 1.2 组件化实现

**React**

```jsx
// 函数组件
function MyComponent(props) {
  return <div>{props.message}</div>;
}

// 类组件
class MyComponent extends React.Component {
  render() {
    return <div>{this.props.message}</div>;
  }
}
```

**Vue**

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  props: ["message"],
};
</script>
```

### 1.3 状态管理

**React**

- 组件内部使用`setState`或 Hooks 的`useState`
- 全局状态管理依赖第三方库如 Redux、Zustand
- 单向数据流，状态更新需要显式传递

**Vue**

- 组件内部使用`data`属性和`$set`
- 官方提供 Vuex/Pinia 进行全局状态管理
- 支持双向数据绑定（v-model），简化表单处理

### 1.4 虚拟 DOM 与渲染

**React**

- 使用 JSX 编写 UI，编译为 React.createElement 调用
- 虚拟 DOM 更新使用 diff 算法，最小化 DOM 操作
- 组件更新默认是全量对比，需要手动优化（shouldComponentUpdate、React.memo）

**Vue**

- 使用模板语法，编译为渲染函数
- 虚拟 DOM 更新同样使用 diff 算法
- 自动进行依赖追踪，只更新变化的组件（响应式系统）

### 1.5 生态系统

**React**

- 更丰富的社区资源和第三方库
- 更广泛的企业应用
- 对 TypeScript 支持良好
- React Native 用于移动端开发

**Vue**

- 官方提供更完整的工具链（Vue CLI、Vite）
- Vuex/Pinia 状态管理更简单易用
- Vue Router API 更直观
- Quasar、Nuxt 等框架提供全栈解决方案

## 2. React Hook 详解

### 2.1 什么是 React Hook

React Hook 是 React 16.8 版本引入的新特性，允许在函数组件中使用状态（state）和其他 React 特性，如生命周期方法、上下文（context）等，而无需编写类组件。

### 2.2 常用 Hook

#### useState

```jsx
import { useState } from "react";

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

#### useEffect

```jsx
import { useState, useEffect } from "react";

function Example() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    document.title = `You clicked ${count} times`;
  }, [count]); // 依赖数组，仅当count变化时执行

  return (
    <div>
      <p>You clicked {count} times</p>
      <button onClick={() => setCount(count + 1)}>Click me</button>
    </div>
  );
}
```

#### useContext

```jsx
import { createContext, useContext } from "react";

const ThemeContext = createContext("light");

function ThemedButton() {
  const theme = useContext(ThemeContext);
  return <button className={theme}>I am styled by theme context</button>;
}
```

#### useReducer

```jsx
import { useReducer } from "react";

function reducer(state, action) {
  switch (action.type) {
    case "increment":
      return { count: state.count + 1 };
    case "decrement":
      return { count: state.count - 1 };
    default:
      return state;
  }
}

function Counter() {
  const [state, dispatch] = useReducer(reducer, { count: 0 });

  return (
    <div>
      <p>Count: {state.count}</p>
      <button onClick={() => dispatch({ type: "increment" })}>+</button>
      <button onClick={() => dispatch({ type: "decrement" })}>-</button>
    </div>
  );
}
```

#### useCallback

```jsx
import { useCallback } from "react";

function Button({ onClick, children }) {
  return <button onClick={onClick}>{children}</button>;
}

function ParentComponent() {
  const handleClick = useCallback(() => {
    console.log("Button clicked");
  }, []); // 空依赖数组，仅创建一次

  return <Button onClick={handleClick}>Click me</Button>;
}
```

#### useMemo

```jsx
import { useMemo } from "react";

function ExpensiveCalculation({ a, b }) {
  const result = useMemo(() => {
    console.log("Calculating...");
    return a * b;
  }, [a, b]); // 仅当a或b变化时重新计算

  return <div>Result: {result}</div>;
}
```

### 2.3 Hook 的使用规则

1. 只能在函数组件的最顶层调用 Hook
2. 只能在 React 函数组件或自定义 Hook 中调用 Hook
3. Hook 的调用顺序必须保持一致（不能在循环、条件或嵌套函数中调用）

## 3. JSX 详解

### 3.1 什么是 JSX

JSX（JavaScript XML）是一种 JavaScript 的语法扩展，允许在 JavaScript 代码中编写类似 HTML 的结构。它是 React 的核心特性之一，用于描述 UI 的结构和外观。

### 3.2 JSX 的基本语法

```jsx
// 基本元素
const element = <h1>Hello, world!</h1>;

// 嵌套元素
const element = (
  <div>
    <h1>Hello</h1>
    <p>Welcome to React</p>
  </div>
);

// 表达式插值
const name = "John";
const element = <h1>Hello, {name}!</h1>;

// 属性
const element = <a href="https://reactjs.org">React官网</a>;

// 动态属性
const url = "https://reactjs.org";
const element = <a href={url}>React官网</a>;

// 样式
const style = { color: "red", fontSize: "20px" };
const element = <h1 style={style}>Styled Text</h1>;

// 类名
const element = <div className="container">Content</div>;

// 条件渲染
const isLoggedIn = true;
const element = isLoggedIn ? <UserGreeting /> : <GuestGreeting />;

// 列表渲染
const numbers = [1, 2, 3, 4, 5];
const listItems = numbers.map((number) => (
  <li key={number.toString()}>{number}</li>
));
```

### 3.3 JSX 的编译过程

JSX 代码不会直接被浏览器解析，需要通过 Babel 等工具编译成普通的 JavaScript 代码：

```jsx
// JSX代码
const element = <h1>Hello, world!</h1>;

// 编译后的JavaScript代码
const element = React.createElement("h1", null, "Hello, world!");
```

### 3.4 JSX 的优点

1. **类型安全**：可以在编译时检测错误
2. **开发效率**：编写 UI 更直观，减少模板与逻辑的分离
3. **性能优化**：与 React 的虚拟 DOM 结合，实现高效渲染
4. **可维护性**：组件化结构使代码更易于维护和复用

## 4. useEffect 与 useLayoutEffect 的区别

### 4.1 相同点

- 都用于处理副作用（数据获取、DOM 操作、订阅等）
- 都在组件渲染后执行
- 都可以通过依赖数组控制执行时机
- 都可以返回清理函数

### 4.2 核心区别

| 特性     | useEffect                            | useLayoutEffect                     |
| -------- | ------------------------------------ | ----------------------------------- |
| 执行时机 | 在浏览器完成绘制后异步执行           | 在 DOM 更新后、浏览器绘制前同步执行 |
| 执行环境 | 不阻塞浏览器绘制                     | 阻塞浏览器绘制                      |
| 适用场景 | 大多数副作用（数据请求、事件监听等） | 需要 DOM 测量或直接影响布局的操作   |
| 性能影响 | 不会导致视觉闪烁                     | 可能导致视觉闪烁（如果执行时间长）  |

### 4.3 代码示例

#### useEffect

```jsx
import { useState, useEffect } from "react";

function Example() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return <div>Window width: {width}px</div>;
}
```

#### useLayoutEffect

```jsx
import { useState, useLayoutEffect } from "react";

function Example() {
  const [width, setWidth] = useState(0);

  useLayoutEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return <div>Window width: {width}px</div>;
}
```

### 4.4 选择建议

1. **优先使用 useEffect**：大多数情况下，useEffect 足够满足需求，且不会阻塞浏览器绘制
2. **仅在必要时使用 useLayoutEffect**：当需要确保 DOM 操作在浏览器绘制前完成，或需要避免视觉闪烁时使用
3. **避免在 useLayoutEffect 中执行耗时操作**：这会阻塞浏览器绘制，影响用户体验

## 5. React 流行面试题及答案

### 5.1 基础概念

#### 5.1.1 什么是虚拟 DOM？它有什么优势？

**答案**：
虚拟 DOM（Virtual DOM）是 React 中的一个概念，它是真实 DOM 的轻量级 JavaScript 表示。当组件状态变化时，React 会先更新虚拟 DOM，然后通过 diff 算法比较新旧虚拟 DOM 的差异，最后只更新真实 DOM 中需要变化的部分。

**优势**：

- 减少 DOM 操作次数，提高性能
- 提供跨平台能力（React Native）
- 简化 DOM 操作的复杂性
- 提高开发效率

#### 5.1.2 什么是 React 组件？组件的类型有哪些？

**答案**：
React 组件是构建 UI 的独立、可复用的模块。每个组件封装了自己的逻辑和渲染输出。

**类型**：

1. **函数组件**：使用函数定义的组件，接收 props 并返回 React 元素
2. **类组件**：使用 ES6 类定义的组件，继承自 React.Component，包含生命周期方法

#### 5.1.3 React 中的状态（state）和属性（props）有什么区别？

**答案**：

- **State**：组件内部管理的数据，可变，用于跟踪组件的状态变化，通过 setState 更新
- **Props**：父组件传递给子组件的数据，只读，子组件不能直接修改 props

### 5.2 组件生命周期

#### 5.2.1 React 类组件的生命周期分为几个阶段？每个阶段有哪些主要方法？

**答案**：
React 类组件的生命周期分为三个主要阶段：

**1. 挂载阶段（Mounting）**

- constructor()：初始化状态和绑定方法
- componentWillMount()（已废弃）：组件挂载前执行
- render()：渲染 UI
- componentDidMount()：组件挂载后执行，适合进行数据请求、DOM 操作等

**2. 更新阶段（Updating）**

- componentWillReceiveProps()（已废弃）：接收新 props 前执行
- shouldComponentUpdate(nextProps, nextState)：决定是否更新组件
- componentWillUpdate()（已废弃）：组件更新前执行
- render()：重新渲染 UI
- componentDidUpdate(prevProps, prevState)：组件更新后执行，适合进行 DOM 操作和比较新旧 props/state

**3. 卸载阶段（Unmounting）**

- componentWillUnmount()：组件卸载前执行，适合清理资源（如事件监听、定时器等）

#### 5.2.2 React 函数组件的生命周期如何处理？

**答案**：
函数组件通过 React Hooks 来模拟生命周期：

- useEffect(() => {}, [])：模拟 componentDidMount
- useEffect(() => { return () => {} }, [])：模拟 componentWillUnmount
- useEffect(() => {}, [deps])：模拟 componentDidUpdate

### 5.3 Hooks 相关

#### 5.3.1 什么是自定义 Hook？它有什么优势？

**答案**：
自定义 Hook 是一个以 use 开头的函数，它可以调用其他 Hook。自定义 Hook 允许我们将组件逻辑提取到可复用的函数中。

**优势**：

- 复用组件逻辑
- 提高代码的可维护性
- 分离关注点
- 使函数组件更简洁

**示例**：

```jsx
import { useState, useEffect } from "react";

function useWindowWidth() {
  const [width, setWidth] = useState(0);

  useEffect(() => {
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    window.addEventListener("resize", updateWidth);
    updateWidth();

    return () => window.removeEventListener("resize", updateWidth);
  }, []);

  return width;
}

// 使用自定义Hook
function App() {
  const width = useWindowWidth();
  return <div>Window width: {width}px</div>;
}
```

#### 5.3.2 useState 和 useReducer 的区别是什么？

**答案**：

- **useState**：用于管理简单的状态，返回状态值和更新函数
- **useReducer**：用于管理复杂的状态逻辑，接收 reducer 函数和初始状态，返回状态和 dispatch 函数

**使用场景**：

- useState：管理单一的布尔值、字符串、数字等简单状态
- useReducer：管理复杂的对象状态或需要根据前一个状态计算新状态的场景

### 5.4 性能优化

#### 5.4.1 React 中有哪些性能优化的方法？

**答案**：

1. **使用 React.memo**：缓存函数组件的渲染结果
2. **使用 useMemo**：缓存昂贵的计算结果
3. **使用 useCallback**：缓存函数引用，避免不必要的重新渲染
4. **合理使用 shouldComponentUpdate**：在类组件中控制更新
5. **使用 React.PureComponent**：自动进行浅比较的类组件
6. **避免在 render 中创建新的函数和对象**
7. **使用虚拟列表**：处理长列表时减少 DOM 节点数量
8. **代码分割**：按需加载组件，减少初始加载时间
9. **使用 React.lazy 和 Suspense**：实现组件的懒加载

#### 5.4.2 什么是 React 的 key 属性？为什么它很重要？

**答案**：
key 是 React 用于识别列表中唯一元素的特殊属性。当列表数据发生变化时，React 使用 key 来确定哪些元素需要更新、删除或创建。

**重要性**：

- 提高渲染性能：避免不必要的 DOM 操作
- 维持组件状态：确保组件在重新排序时保持其状态
- 避免警告：React 会在没有 key 的列表上发出警告

**注意事项**：

- key 应该是唯一的，但不需要全局唯一，只需要在列表内唯一
- 避免使用索引作为 key（特别是列表会重新排序时）
- 理想的 key 是数据的唯一标识符，如 ID

### 5.5 高级概念

#### 5.5.1 什么是 React 的上下文（Context）？它有什么用途？

**答案**：
React Context 提供了一种在组件树中共享值的方式，无需在每个层级手动传递 props。

**用途**：

- 共享全局状态（如主题、用户信息等）
- 避免 props drilling（在多层组件间传递 props）
- 简化组件间的通信

**示例**：

```jsx
// 创建Context
const ThemeContext = React.createContext("light");

// 提供Context值
function App() {
  return (
    <ThemeContext.Provider value="dark">
      <Header />
    </ThemeContext.Provider>
  );
}

// 消费Context值
function Header() {
  return (
    <ThemeContext.Consumer>
      {(theme) => <div className={`header header-${theme}`}>Header</div>}
    </ThemeContext.Consumer>
  );
}

// 使用useContext（函数组件）
function Header() {
  const theme = useContext(ThemeContext);
  return <div className={`header header-${theme}`}>Header</div>;
}
```

#### 5.5.2 什么是 React 的高阶组件（HOC）？

**答案**：
高阶组件（Higher-Order Component）是一个函数，接收一个组件并返回一个新的组件。它用于复用组件逻辑，是 React 中的一种高级复用技术。

**示例**：

```jsx
function withLoading(WrappedComponent) {
  return function WithLoadingComponent({ isLoading, ...props }) {
    if (isLoading) {
      return <div>Loading...</div>;
    }
    return <WrappedComponent {...props} />;
  };
}

// 使用HOC
const UserProfileWithLoading = withLoading(UserProfile);

// 渲染
<UserProfileWithLoading isLoading={isLoading} user={user} />;
```

#### 5.5.3 React 中的虚拟 DOM 和 diff 算法是如何工作的？

**答案**：

1. **虚拟 DOM 创建**：React 将组件渲染为虚拟 DOM 树（JavaScript 对象）
2. **状态更新**：当组件状态变化时，React 创建新的虚拟 DOM 树
3. **Diff 算法**：比较新旧虚拟 DOM 树的差异
   - 同层比较：只比较同一层级的节点
   - 节点类型不同：直接替换整个子树
   - 节点类型相同：比较属性和内容
   - 使用 key 识别列表中的唯一元素
4. **DOM 更新**：只将差异部分应用到真实 DOM

### 5.6 状态管理

#### 5.6.1 Redux 的核心概念是什么？

**答案**：
Redux 是一个用于 JavaScript 应用的状态容器，提供可预测的状态管理。

**核心概念**：

1. **Store**：存储应用的整个状态
2. **Action**：描述状态变化的对象，包含 type 和 payload
3. **Reducer**：纯函数，接收旧状态和 action，返回新状态
4. **Dispatch**：发送 action 到 store 的方法
5. **Subscribe**：监听状态变化的方法

**Redux 工作流**：

- 组件通过 dispatch 发送 action
- Store 调用 reducer 处理 action
- Reducer 返回新的状态
- Store 更新状态
- 订阅者（组件）接收到状态更新并重新渲染

#### 5.6.2 Redux 和 React Context 的区别是什么？

**答案**：

- **复杂度**：Context 更简单，Redux 更复杂
- **功能**：Redux 提供更完整的状态管理功能（中间件、时间旅行调试等）
- **性能**：大量状态更新时 Redux 性能更好，Context 可能导致不必要的重渲染
- **适用场景**：
  - Context：中小型应用，共享少量全局状态
  - Redux：大型应用，需要复杂的状态管理和调试工具

### 5.7 路由

#### 5.7.1 React Router 的核心组件有哪些？

**答案**：
React Router 是 React 应用中常用的路由库，核心组件包括：

- **BrowserRouter**：使用 HTML5 的 history API 实现路由
- **HashRouter**：使用 URL 的 hash 实现路由
- **Route**：定义路由规则，渲染匹配的组件
- **Switch**：只渲染第一个匹配的 Route 组件
- **Link**：创建导航链接，避免页面刷新
- **NavLink**：带有激活状态的 Link 组件
- **Redirect**：重定向到另一个路由
- **useParams**：获取 URL 参数的 Hook
- **useRouteMatch**：获取当前路由匹配信息的 Hook
- **useHistory**/useNavigate：导航控制的 Hook

**示例**：

```jsx
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom";

function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li>
              <Link to="/">Home</Link>
            </li>
            <li>
              <Link to="/about">About</Link>
            </li>
          </ul>
        </nav>

        <Switch>
          <Route exact path="/">
            <Home />
          </Route>
          <Route path="/about">
            <About />
          </Route>
        </Switch>
      </div>
    </Router>
  );
}
```

### 5.8 测试

#### 5.8.1 React 应用的测试工具有哪些？

**答案**：

1. **Jest**：JavaScript 测试框架，用于编写和运行单元测试
2. **React Testing Library**：用于测试 React 组件的库，强调测试组件的行为而非实现细节
3. **Enzyme**：Airbnb 开发的 React 测试工具，提供了浅渲染、挂载等功能
4. **Cypress**：端到端测试工具，用于测试完整的用户流程
5. **Storybook**：组件开发和测试工具，用于隔离测试组件

#### 5.8.2 如何测试 React 组件？

**答案**：
使用 React Testing Library 测试组件的基本步骤：

```jsx
import { render, screen, fireEvent } from "@testing-library/react";
import Button from "./Button";

describe("Button", () => {
  test("renders correctly", () => {
    render(<Button>Click me</Button>);
    const buttonElement = screen.getByText(/click me/i);
    expect(buttonElement).toBeInTheDocument();
  });

  test("calls onClick handler when clicked", () => {
    const mockOnClick = jest.fn();
    render(<Button onClick={mockOnClick}>Click me</Button>);

    const buttonElement = screen.getByText(/click me/i);
    fireEvent.click(buttonElement);

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});
```

## 6. 总结

React 和 Vue 都是优秀的前端框架，各有其优势和适用场景。React 更注重灵活性和组件化，适合构建大型、复杂的应用；Vue 更注重易用性和渐进式学习，适合快速开发和中小型应用。

React Hook 的引入使函数组件具备了类组件的所有功能，简化了组件逻辑的管理。JSX 作为 React 的核心特性，提供了一种直观的方式来描述 UI。useEffect 和 useLayoutEffect 用于处理副作用，但在执行时机上有所不同，需要根据具体场景选择使用。

掌握 React 的核心概念、组件生命周期、状态管理、性能优化等知识，对于通过 React 相关的面试至关重要。本文档涵盖了 React 和 Vue 的深度对比以及 React 面试中常见的问题和答案，希望能帮助你更好地准备面试。

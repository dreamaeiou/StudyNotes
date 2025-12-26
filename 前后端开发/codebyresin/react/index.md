# React

### 特新

- JSX
- 单向数据绑定
- 虚拟 DOM
- 声明式编程
- Component
- props 和 state

1. 相同点：
   两者都是 JavaScript 对象
   两者都是⽤于保存信息
   props 和 state 都能触发渲染更新
2. 区别：
   props 是外部传递给组件的，⽽ state 是在组件内被组件⾃⼰管理的，⼀般在 constructor 中初始
   化
   props 在组件内部是不可修改的，但 state 在组件内部可以进⾏修改
   state 是多变的、可以修改

### 受控与非受控

受我们控制的组件和不受我们控制的组件

### hooks

- useState:给组件添加状态
- useEffect：处理副作用，如网络请求等
- useRef：获取 DOM 元素的引用且不会触发重新渲染的值
- useContext：在组件树中访问到：Context
- useReducer:给组件创建一个复杂状态管理
- useMemo 和 useCallback：用于性能优化，避免不必要的渲染

### 组件通信方式

1. 父传子 父组件可以通过 props 将数据和函数传递给子组件
2. 子传父 通过调用父组件传递过来的函数，把值传给父组件
3. 兄弟组件 提升 state 到父组件中，作为“中介”传值
4. 跨层级通信 useContext、createContext
5. 全局状态管理 redux、zustand

### History 改动监听

//TODO

```js
// 1. popstate 事件 - 监听浏览器前进后退
window.addEventListener("popstate", (event) => {
  console.log("位置变化了:", {
    location: window.location.href,
    state: event.state,
    time: new Date().toISOString(),
  });
});

// 2. hashchange 事件 - 监听 hash 变化 (#后面的部分)
window.addEventListener("hashchange", (event) => {
  console.log("hash 变化了:", {
    oldURL: event.oldURL,
    newURL: event.newURL,
  });
});

// History API 提供了这两个方法修改 URL
history.pushState(state, title, url); // 不会触发 popstate
history.replaceState(state, title, url); // 不会触发 popstate

// 所以需要监听这两个方法调用
```

### 虚拟 dom 和真实 dom 区别

1. 本质区别：
   真实 DOM：浏览器中真实存在的文档对象模型，是浏览器提供的用于操作页面元素和内容的 API。真实 DOM 由浏览器维护，直接操作真实 DOM 会影响页面的实际渲染。
   虚拟 DOM：是 React 中用来描述真实 DOM 的 JavaScript 对象。它并不是真实的 DOM，而是对真实 DOM 的一种轻量级的抽象表示。
2. 性能差异：
   操作真实 DOM：直接操作真实 DOM 是非常消耗性能的，因为每次 DOM 操作都会导致浏览器重新计算样式、布局和重绘。频繁的 DOM 操作会导致页面性能下降。
   虚拟 DOM：由于虚拟 DOM 是 JavaScript 对象，操作 JavaScript 对象比操作真实 DOM 要快得多。React 通过比较虚拟 DOM 的差异，然后将最小化的变更批量更新到真实 DOM，从而减少直接操作真实 DOM 的次数，提高性能。
3. 更新机制：
   真实 DOM：每次更新都会立即反映在页面上，但频繁更新会导致页面不断重绘和重排，影响用户体验。
   虚拟 DOM：当组件的状态或属性发生变化时，React 会创建一个新的虚拟 DOM 树，然后与上一次的虚拟 DOM 树进行对比（diff 算法），找出需要更新的部分，然后批量、异步地更新到真实 DOM 中。这个过程称为协调（Reconciliation）。
4. 跨平台能力：
   真实 DOM：与浏览器环境紧密绑定，无法在非浏览器环境（如服务器端、移动端原生应用）中使用。
   虚拟 DOM：由于是 JavaScript 对象，可以在任何支持 JavaScript 的环境中使用。React Native 就是利用虚拟 DOM 来渲染原生组件，实现了跨平台开发。
5. 开发方式：
   真实 DOM：开发者需要直接操作 DOM，代码中会包含大量的 DOM 操作，难以维护，且容易出错。
   虚拟 DOM：开发者只需关注组件的状态和属性，React 会自动处理 DOM 的更新。这种方式使开发者能够以声明式的方式编写 UI，提高了开发效率和代码可维护性。

```js
// 真实DOM结构（浏览器内部表示）
真实DOM节点: {
  nodeType: 1,
  nodeName: "DIV",
  attributes: {id: "app", class: "container"},
  childNodes: [...],
  innerHTML: "...",
  // 包含大量属性和方法，约 700+ 属性
  // 如 offsetWidth, scrollTop, getBoundingClientRect 等
}

// 虚拟DOM结构（React元素）
虚拟DOM节点: {
  $$typeof: Symbol(react.element),
  type: "div",
  props: {
    id: "app",
    className: "container",
    children: [...]
  },
  key: null,
  ref: null,
  _owner: null,
  _store: {}
  // 只有几十个属性，非常轻量
}
```

### Hash 与 History 路由

1. Hash

Hash 模式利用 URL 中的 hash（#）部分来模拟路由。当 URL 的 hash 部分改变时，浏览器不会向服务器发送请求，服务器端不会接收到 hash 部分，即服务器收到的请求中不包括#及其后面的部分，但会触发 hashchange 事件，前端可以监听这个事件并更新视图。

特点

URL 中带有#符号，例如：http://example.com/#/home
改变 hash 不会重新加载页面，因此不会向服务器发送请求。
兼容性好，支持所有浏览器（包括 IE8）。
服务器端不会接收到 hash 部分，即服务器收到的请求中不包括#及其后面的部分。

```js
// 实现方式
// 监听hash变化
window.addEventListener("hashchange", function () {
  const hash = window.location.hash.slice(1) || "/";
  // 根据hash更新视图
  render(hash);
});

// 手动改变hash
window.location.hash = "/home";
```

2. History
   History 模式利用 HTML5 的 History API（pushState、replaceState）来操作浏览器的历史记录栈，从而改变 URL 而不重新加载页面。同时，前端需要监听 popstate 事件（当用户点击浏览器的前进/后退按钮时触发）来更新视图。

特点
URL 是正常的，没有#，例如：http://example.com/home
需要服务器支持，因为当用户直接访问一个由前端路由定义的 URL 时，服务器可能会返回 404。
利用 History API，可以添加和修改历史记录条目。

```js
// 监听popstate事件（用户点击前进/后退按钮）
window.addEventListener("popstate", function () {
  const path = window.location.pathname;
  // 根据路径更新视图
  render(path);
});

// 使用pushState改变URL，并更新视图
function navigate(path) {
  history.pushState(null, "", path);
  render(path);
}
```

### react diff 算法

React 的 Diff 算法是 React 虚拟 DOM 更新的核心，其目的是高效地找出虚拟 DOM 树的变化，最小化真实 DOM 的操作。

#### Reacr Diff 三大策略

1. 同级比较（Tree Diff）
   React 只会对同一层级的节点进行比较，不会跨层级比较。
   当节点跨层级移动时，React 会删除旧节点，创建新节点，而不是移动。

```js
// 示例：跨层级移动节点
// 旧树
<div>
  <A />
</div>

// 新树
<section>
  <div>
    <A />  {/* 虽然A还在，但层级变了 */}
  </div>
</section>

// React 处理：
// 1. 发现 div → section，类型不同，删除 div 及其子节点
// 2. 创建新的 section 和 div
// 3. 创建新的 A
// 即使 A 没变，也会被重新创建
```

2. 组件比较（Component Diff）
   如果是同一类型的组件，React 会继续比较其子节点。如果是不同类型的组件，React 会直接替换整个组件树。

```js
// 组件类型相同：更新 props，继续 diff
<Button color="red" /> → <Button color="blue" />

// 组件类型不同：完全替换
<Button /> → <Input />  // Button 组件及其子节点全部卸载，Input 组件挂载
```

优化策略：React 通过 shouldComponentUpdate()或 React.memo()可以避免不必要的组件更新。

3. 元素比较（Element Diff）和 Key 的作用

```js
// 旧列表
<ul>
  <li key="a">A</li>
  <li key="b">B</li>
  <li key="c">C</li>
</ul>

// 新列表
<ul>
  <li key="b">B</li>
  <li key="a">A</li>
  <li key="d">D</li>  {/* 新增 */}
  <li key="c">C</li>
</ul>

// React 的 diff 过程：
// 1. 用 key 建立旧节点的映射
// 2. 遍历新节点：
//    - key="b": 找到旧节点，移动到位置0
//    - key="a": 找到旧节点，移动到位置1
//    - key="d": 没找到，创建新节点
//    - key="c": 找到旧节点，移动到位置3
// 3. 删除旧列表中剩余的节点（这里没有）
```

### React key 作用

React 的 key 主要作用就是对 React 进行性能优化的，主要是用于列表中。

```js
// React 内部的简化 diff 逻辑
function updateChildren(prevChildren, nextChildren) {
  const children = {};
  const nextKeys = {};

  // 1. 用 key 建立映射
  prevChildren.forEach((child) => {
    children[child.key] = child;
  });

  // 2. 遍历新 children
  nextChildren.forEach((nextChild) => {
    const key = nextChild.key;
    const prevChild = children[key];

    if (prevChild) {
      // 3. key 存在，更新组件
      updateElement(prevChild, nextChild);
      delete children[key]; // 标记为已处理
    } else {
      // 4. key 不存在，创建新组件
      createElement(nextChild);
    }
  });

  // 5. 删除未使用的旧组件
  Object.values(children).forEach((child) => {
    removeElement(child);
  });
}
```

### React 中 diff 算法的较详细

```js
// 伪代码展示 Diff 算法
function diffChildren(oldChildren, newChildren) {
  const oldMap = {};
  const newMap = {};
  const patches = [];

  // 第一轮遍历：用 key 建立映射
  for (let i = 0; i < oldChildren.length; i++) {
    const child = oldChildren[i];
    if (child.key) {
      oldMap[child.key] = { child, index: i };
    }
  }

  for (let i = 0; i < newChildren.length; i++) {
    const child = newChildren[i];
    if (child.key) {
      newMap[child.key] = { child, index: i };
    }
  }

  // 第二轮遍历：处理移动、新增、删除
  let lastIndex = 0;

  for (let i = 0; i < newChildren.length; i++) {
    const newChild = newChildren[i];
    const oldChild = findOldChild(newChild, oldMap);

    if (oldChild) {
      if (oldChild.index < lastIndex) {
        // 需要移动
        patches.push({ type: "MOVE", from: oldChild.index, to: i });
      }
      lastIndex = Math.max(lastIndex, oldChild.index);

      // 递归比较子节点
      const childPatches = diff(oldChild.child, newChild);
      if (childPatches.length > 0) {
        patches.push(...childPatches);
      }

      // 标记为已处理
      delete oldMap[newChild.key];
    } else {
      // 新增节点
      patches.push({ type: "INSERT", node: newChild, index: i });
    }
  }

  // 第三轮：删除剩余的旧节点
  Object.values(oldMap).forEach(({ index }) => {
    patches.push({ type: "REMOVE", index });
  });

  return patches;
}
```

### 路由守卫

路由守卫是在路由跳转前后执行的钩子函数，用于控制路由的访问权限、数据预加载、页面切换动画等。
![路由守卫](./Router/index.md)
//具体看腾讯元宝分组

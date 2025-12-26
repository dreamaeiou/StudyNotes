//bind
Function.prototype.myBind = function (context) {
  //判断对象是否为函数
  //谁调用bind，this指向谁
  if (typeof this !== "function") {
    throw new TypeError("not function");
  }
  const args = [...arguments].slice(1);
  //保存调用bind的函数
  const fn = this;
  //返回新函数，该函数记录原函数和绑定参数
  return function Fn() {
    // 根据调⽤⽅式，传⼊不同绑定值
    return fn.apply(
      this instanceof Fn ? new fn(...arguments) : context,
      args.concat(...arguments)
    );
  };
};
//new
function myNew(constructor) {
  let obj = {};
  obj.__proto__ = constructor.prototype;
  const args = Array.prototype.slice.call(arguments, 1);
  const res = constructor.apply(obj, args);
  return typeof res === "object" ? res : obj;
}

// 函数柯里化
function getArea(width, height) {
  return width * height;
}
function getArea1(width) {
  return (height) => {
    return width * height;
  };
}

//obj浅拷贝
function shallowClone(obj) {
  const newObj = {};
  for (let prop in obj) {
    if (obj.hasOwnProperty(prop)) {
      newObj[prop] = obj[prop];
    }
  }
  return newObj;
}

/**
 * @深拷贝
 * @param {} obj
 * @param {*} hash
 * @returns
 */
function deepClone(obj, hash = new WeakMap()) {
  if (obj === null || obj === undefined) return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof RegExp) return new RegExp(obj);
  if (typeof obj != "object") return obj;
  if (hash.get(obj)) return hash.get(obj);
  const cloneObj = new obj.constructor();
  hash.set(obj, cloneObj);
  for (let key in obj) {
    if (obj.hasOwnProperty(key)) {
      //判断属性是否时自己的，而不是原型链继承的
      cloneObj[key] = deepClone(obj[key], hash);
    }
  }
  return cloneObj;
}

/**
 * @函数缓存
 * @param {*} func
 * @param {*} context
 * @returns
 */
const memorize = function (func, context) {
  const cache = Object.create(null);
  const ctx = context || this;
  return function (...args) {
    const key = JSON.stringify(args);
    if (!key in cache) {
      cache[key] = func.apply(ctx, args);
    }
    return cache[key];
  };
};
const obj = {
  name: "test",
  getValue: function (x) {
    return this.name + x; // 这里依赖 this
  },
};

const memoizedGet = memorize(obj.getValue, obj);

/**
 * @防抖
 */
function debounce(func, wait, immediate) {
  let timeout;
  return function () {
    let context = this;
    let args = arguments;
    if (timeout) clearTimeout(timeout);
    if (immediate) {
      let callNow = !timeout;
      timeout = timeout(() => {
        timeout = null;
      }, wait);
      if (callNow) {
        func.apply(context, args);
      }
    } else {
      timeout = setTimeout(function () {
        func.apply(context, args);
      }, wait);
    }
  };
}

/**
 * @节流
 */
function throttled(func, delay = 500) {
  let timer = null;
  return function (...args) {
    if (!timer) {
      timer = setTimeout(() => {
        func.apply(this.args);
        timer = null;
      }, delay);
    }
  };
}
function myDateThrolled(func, delay) {
  let oldTime = Date.now();
  return function () {
    const context = this; // 保存正确的this
    const args = arguments; // 保存参数
    let newTime = Date.now();
    if (newTime - oldTime >= delay) {
      func.apply(context, args);
      oldTime = Date.now();
    }
  };
}

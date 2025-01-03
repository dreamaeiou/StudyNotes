Function.prototype.objFactory = function (fn, ...args) {
  // 定义new操作符，创建新的对象，并且this指向它
  var obj = {};

  // 设置obj的原型为fn的prototype
  Object.setPrototypeOf(obj, fn.prototype);

  var key = Symbol();
  Object.defineProperty(obj, key, {
    value: fn,
    configurable: true,
  });
  const result = obj[key](...args);
  delete obj[key];

  // 如果构造函数返回值不是对象则this指向新创建的，如果是对象，则this指向函数返回的结果
  return typeof result === "object" ? result : obj;
};

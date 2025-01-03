Function.prototype.DcBind = function (context, ...args) {
  if (typeof this !== "function") {
    throw new Error(
      "Function.prototype.bind - what is trying to be bound is not callable"
    );
  }
  context = context ? Object(context) : globalThis;

  // _this为调用的函数 eg：fn.bind()  _this指向fn
  var _this = this;

  function resultFn(...argsFn) {
    // 判断是否通过new调用，如果是则创建一个对象，让这个对象的原型为外层函数的prototype属性
    if (this instanceof resultFn) {
      var obj = {};
      Object.setPrototypeOf(obj, _this.prototype);
      context = obj; // 将context赋值成obj，因为后面需要把this修改成obj
    }

    var key = Symbol();
    Object.defineProperty(context, key, {
      value: _this,
      configurable: true,
    });

    // 因为可能存在new bindFoo("18")，即在new的时候也传递参数，所以需要将resultFn的参数拼接上去
    var result = context[key](...argsFn.concat(args));
    delete context[key];

    // 如果是new调用则返回对象，如果不是则返回函数调用后的结果
    var res = this instanceof resultFn ? context : result;
    return res;
  }

  return resultFn;
};

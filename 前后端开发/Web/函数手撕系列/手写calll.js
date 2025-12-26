Function.prototype.DcCall = function (context, ...args) {
  // 如果传递的是null或者为undefined则返回globalThis
  // 如果有值则返回对应的Object()的结果，如果该值已经是一个对象，则返回该值。否则，它将返回与给定值对应的类型的对象。例如，传递 BigInt 基本类型会返回一个 BigInt 封装对象。
  context = context ? Object(context) : globalThis;

  // 通过Symbol和defineproperty来让属性不显示和无法被外界访问
  var key = Symbol();
  Object.defineProperty(context, key, {
    value: this,
    configurable: true, // 为true时，才能删除
  });
  var result = context[key](...args);
  delete context[key]; // 删掉添加的属性，防止污染传递的context
  return result;
};

/* 
测试用例
function fn(a) {
  console.log(this, a);

  return 1;
}
const obj = {};
console.log(fn.DcCall(1)); 
*/

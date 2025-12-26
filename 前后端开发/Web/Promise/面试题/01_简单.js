// 下面代码的输出结果是什么
const p1 = new Promise((resolve, reject) => {
  resolve(1);
});
const p2 = p1.then((res) => {
  console.log(res); // 1
  return 2;
});
const p3 = p2.catch((err) => {
  return 3;
});
const p4 = p3.then((res) => {
  console.log(res); // 2
  return 10;
});

console.log(p1, p2, p3, p4);
setTimeout(() => {
  console.log(p1, p2, p3, p4);
}, 1000);


// 答案
// Promise { 1 } Promise { <pending> } Promise { <pending> } Promise { <pending> }
// 1
// 2
// Promise { 1 } Promise { 2 } Promise { 2 } Promise { 10 }

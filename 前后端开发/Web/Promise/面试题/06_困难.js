const p1 = new Promise((resolve) => {
  resolve();
});

const p2 = new Promise((resolve) => {
  resolve(p1);
});

p2.then(() => {
  console.log("1");
}).then(() => {
  console.log("2");
});

p1.then(() => {
  console.log("3");
}).then(() => {
  console.log("4");
});

/* 
    题目较难，算是Promise的终极难度
    答案：3 4 1 2
    如果对题目不理解，可以通过19301430776（微信）/ 2103327241@qq.com（邮箱）联系我
*/

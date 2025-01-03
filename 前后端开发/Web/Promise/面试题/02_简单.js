// 下面代码的输出结果是什么
const pro = new Promise((resolve, reject) => {
  resolve(1);
})
  .then((res) => {
    console.log(res); // 1
    return new Error("2"); // 返回的是错误对象，不是抛出
  })
  .catch((err) => {
    throw err;
    return 3;
  })
  .then((res) => {
    console.log(res); // 错误对象2（没有报错，返回的对象是错误对象）
  });

setTimeout(() => {
  console.log(pro); // Promise { undefined }
}, 1000);

/* 
答案：
	1

	Error: 2
    at D:\Study\web前端\练习\Test程序思维\index.js:27:12
    at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
    
	Promise { undefined }
*/

/* 
分析过程：
    把pro分成4个promise都要分析

    一开始P1为fulfilled值为1 p2、p3、p4的状态都是pending
    
    然后微任务处理完成后

    p2的状态为fulfilled 值为错误对象2，p3由于没有对应的后续操作，所以p3的状态和p2的状态保持一致，p4的状态为fulfilled 值为undefine
*/

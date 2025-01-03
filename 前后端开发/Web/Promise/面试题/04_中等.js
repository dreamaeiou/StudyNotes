async function m() {
  const n = await 1;
  console.log(n);
}

(async () => {
  await m();
  console.log(2);
})();

console.log(3);

/* 
  3
  1
  2
*/

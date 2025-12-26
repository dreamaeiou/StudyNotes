const marked = require("marked");
module.exports = (source) => {
  //source是webpack传递过来的文件信息，在配置文件写loader会自动传递进来
  //loader要返回js格式
  const html = marked(source);
  // return `module.exports = "${html}"`
  // return `export default ${JSON.stringify(html)}`

  // 返回 html 字符串交给下一个 loader 处理
  return html;
};

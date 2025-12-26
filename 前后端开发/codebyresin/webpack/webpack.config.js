const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const webpack = require("webpack"); //to access built-in plugins

const { CleanWebpackPlugin } = require("clean-webpack-plugin");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const CopyWebpackPlugin = require("copy-webpack-plugin");

//loader是加载器，用于构建中使用的
//plugin是插件

module.exports = {
  mode: "production", //development,none,production
  entry: "./path/to/my/entry/file.js", //入口文件
  output: {
    //打包出口
    path: path.resolve(__dirname, "dist"),
    filename: "my-first-webpack.bundle.js",
  },
  optimization: {
    //集中配置webpack相关的优化属性
    usedExports: true, //只导出外部使用过的成员
    minimize: true, //代码压缩
    concatenateModules: true, //尽可能将所有模块合并输出到一个函数，减少体积
    sideEffects: true, //开启按需导入
    splitChunks: {
      chunks: "all", //所有公共模块提取单独bundle中
    },
  },
  devtool: "source-map", //打包后的文件正确找到错误文件位置
  devServer: {
    // hot: true, //开启HMR，这个万一给错误代码打包，引发回退刷新，不知道哪里错了
    hotOnly: true, //故用这个
    contentBase: ["./public"],
    //跨域代理
    proxy: {
      "/api": {
        //http://localhost:8080/api/users -> https://api.github.com/api/users
        target: "https://api.github.com",
        pathRewrite: {
          "^api": "",
        },
        changeOrigin: true,
        // https://api.github.com/users
      },
    },
  },
  module: {
    rules: [
      {
        text: /\.md/,
        use: ["html-loader", "./markdown-loader.js"],
      },
      {
        text: /\.text$/,
        use: "raw-loader",
      },
      {
        test: /.css$/,
        use: ["style-loader", "css-loader"],
      },
      {
        test: /.png$/,
        use: {
          loader: "url-loader",
          options: {
            limit: 10 * 1024, // 10 KB
          },
        },
      }, //这地方要下载url/file-loader
      {
        test: /\.js$/,
        use: {
          loader: "babel-loader",
          options: {
            //配置选项
            presets: [
              [
                "@babel/preset-env",
                // { modules: "commonjs" },
                //强制使用esmodules插件
              ],
            ],
          },
        },
      },
    ],
  },
  plugins: [
    new webpack.ProgressPlugin(),
    new webpack.DefinePlugin({
      API_BASE_URL: "'https://api.example.com'",
    }),
    new CleanWebpackPlugin(),
    // 用于生成 index.html
    new HtmlWebpackPlugin({
      title: "Webpack Tutorials",
      meta: {
        viewport: "width=device-width",
      },
      template: "./src/index.html",
    }),
    new webpack.HotModuleReplacementPlugin(), //HMR所需要的plugins
    // 开发阶段最好不用，在上线前使用，不然每次打包开销太大
    // new CopyWebpackPlugin([
    //   // 'public/**'
    //   "public",
    // ]),
  ],
};

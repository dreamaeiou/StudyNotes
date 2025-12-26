// Node.js + Express 示例
const express = require("express");
const app = express();

// 1. 单个路由设置缓存
app.get("/static/image.jpg", (req, res) => {
  // 设置缓存1小时
  res.set({
    "Cache-Control": "public, max-age=3600",
    Expires: new Date(Date.now() + 3600000).toUTCString(),
  });
  res.sendFile("image.jpg");
});

// 2. 中间件统一设置
app.use("/static", (req, res, next) => {
  // 根据文件类型设置不同缓存
  if (req.url.endsWith(".js") || req.url.endsWith(".css")) {
    res.set("Cache-Control", "public, max-age=31536000, immutable"); // 1年
  } else if (req.url.endsWith(".jpg") || req.url.endsWith(".png")) {
    res.set("Cache-Control", "public, max-age=86400"); // 1天
  } else {
    res.set("Cache-Control", "public, max-age=300"); // 5分钟
  }
  next();
});

// 3. 静态文件中间件自带缓存
app.use(
  "/public",
  express.static("public", {
    maxAge: "1d", // 缓存1天
    immutable: true,
    etag: true, // 启用ETag
    lastModified: true,
  })
);

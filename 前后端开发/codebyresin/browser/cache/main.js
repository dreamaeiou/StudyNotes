// main.js - 主线程中注册
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/sw.js")
      .then((registration) => {
        console.log("Service Worker 注册成功:", registration.scope);

        // 检查更新
        registration.addEventListener("updatefound", () => {
          const newWorker = registration.installing;
          console.log("发现新版本:", newWorker.state);

          newWorker.addEventListener("statechange", () => {
            if (newWorker.state === "installed") {
              if (navigator.serviceWorker.controller) {
                // 新版本已安装，提示用户刷新
                showUpdateNotification();
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Service Worker 注册失败:", error);
      });
  });

  // 监听 Service Worker 消息
  navigator.serviceWorker.addEventListener("message", (event) => {
    console.log("收到 Service Worker 消息:", event.data);
  });
}

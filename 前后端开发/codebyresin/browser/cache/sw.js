// sw.js
const CACHE_NAME = "my-app-v1";
const OFFLINE_URL = "/offline.html";

// 需要预缓存的核心资源
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/styles/main.css",
  "/scripts/main.js",
  "/images/logo.png",
  "/manifest.json",
  OFFLINE_URL,
];

// 需要缓存的 API 路径（正则匹配）
const API_CACHE_PATTERNS = [
  /^https:\/\/api\.example\.com\/v1\/posts/,
  /^https:\/\/api\.example\.com\/v1\/users\/profile/,
];

// 不缓存的路径
const NO_CACHE_PATTERNS = [/\/logout/, /\/payment/, /\/admin/];

// ========== 安装阶段 ==========
self.addEventListener("install", (event) => {
  console.log("Service Worker 安装中...");

  // 跳过等待，直接激活
  self.skipWaiting();

  // 预缓存核心资源
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("开始预缓存...");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => {
        console.log("预缓存完成");
        return self.skipWaiting();
      })
  );
});

// ========== 激活阶段 ==========
self.addEventListener("activate", (event) => {
  console.log("Service Worker 激活中...");

  // 清理旧缓存
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("删除旧缓存:", cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        // 接管所有客户端
        return self.clients.claim();
      })
  );
});

// ========== 请求拦截 ==========
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // 跳过非 GET 请求
  if (request.method !== "GET") {
    return;
  }

  // 检查是否在不缓存列表中
  if (NO_CACHE_PATTERNS.some((pattern) => pattern.test(url.pathname))) {
    console.log("跳过缓存:", url.pathname);
    return;
  }

  // 根据请求类型选择缓存策略
  if (url.origin === location.origin) {
    // 同源请求：静态资源用缓存优先，动态内容用网络优先
    if (isStaticAsset(url)) {
      event.respondWith(cacheFirstStrategy(request));
    } else {
      event.respondWith(networkFirstStrategy(request));
    }
  } else if (isCacheableAPI(url)) {
    // API 请求：使用 Stale-While-Revalidate
    event.respondWith(staleWhileRevalidateStrategy(request));
  } else {
    // 其他跨域请求：网络优先
    event.respondWith(networkFirstStrategy(request));
  }
});

// ========== 策略函数 ==========

// 判断是否为静态资源
function isStaticAsset(url) {
  return /\.(css|js|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot)$/.test(
    url.pathname
  );
}

// 判断是否为可缓存的 API
function isCacheableAPI(url) {
  return API_CACHE_PATTERNS.some((pattern) => pattern.test(url.href));
}

// 缓存优先策略
function cacheFirstStrategy(request) {
  return caches
    .open(CACHE_NAME)
    .then((cache) => cache.match(request))
    .then((response) => response || fetchAndCache(request));
}

// 网络优先策略
function networkFirstStrategy(request) {
  return fetch(request)
    .then((response) => {
      // 请求成功，更新缓存
      if (response.status === 200) {
        const responseClone = response.clone();
        caches
          .open(CACHE_NAME)
          .then((cache) => cache.put(request, responseClone));
      }
      return response;
    })
    .catch(() => {
      // 网络失败，尝试缓存
      return caches
        .match(request)
        .then((response) => response || caches.match(OFFLINE_URL));
    });
}

// Stale-While-Revalidate 策略
function staleWhileRevalidateStrategy(request) {
  return caches
    .open(CACHE_NAME)
    .then((cache) => cache.match(request))
    .then((cachedResponse) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          // 成功的网络响应，更新缓存
          if (response.status === 200) {
            const responseClone = response.clone();
            cache.put(request, responseClone);

            // 通知页面数据已更新
            notifyClientIfNeeded(request, responseClone);
          }
          return response;
        })
        .catch(() => {
          // 网络失败，忽略
          console.log("后台更新失败:", request.url);
        });

      return cachedResponse || fetchPromise;
    });
}

// 通用：获取并缓存
function fetchAndCache(request) {
  return fetch(request).then((response) => {
    // 检查响应是否有效
    if (!response || response.status !== 200) {
      return response;
    }

    // 克隆响应并缓存
    const responseToCache = response.clone();
    caches.open(CACHE_NAME).then((cache) => {
      cache.put(request, responseToCache);
    });

    return response;
  });
}

// ========== 后台同步 ==========
self.addEventListener("sync", (event) => {
  console.log("后台同步事件:", event.tag);

  if (event.tag === "sync-posts") {
    event.waitUntil(syncPendingPosts());
  }
});

// 同步待发文章
function syncPendingPosts() {
  return getPendingPosts().then((posts) => {
    return Promise.all(
      posts.map((post) => {
        return fetch("https://api.example.com/v1/posts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(post),
        }).then((response) => {
          if (response.ok) {
            // 同步成功，从待发列表中移除
            return removePendingPost(post.id);
          }
          throw new Error("同步失败");
        });
      })
    );
  });
}

// ========== 推送通知 ==========
self.addEventListener("push", (event) => {
  console.log("收到推送消息:", event.data.text());

  const options = {
    body: event.data.text(),
    icon: "/images/icon-192.png",
    badge: "/images/badge-72.png",
    vibrate: [200, 100, 200],
    data: {
      url: "https://example.com",
    },
    actions: [
      { action: "open", title: "打开" },
      { action: "close", title: "关闭" },
    ],
  };

  event.waitUntil(self.registration.showNotification("新消息", options));
});

self.addEventListener("notificationclick", (event) => {
  console.log("通知被点击:", event.action);

  event.notification.close();

  if (event.action === "open") {
    event.waitUntil(clients.openWindow(event.notification.data.url));
  }
});

// ========== 工具函数 ==========

// 获取待发文章
function getPendingPosts() {
  return new Promise((resolve) => {
    const request = indexedDB.open("appDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["pendingPosts"], "readonly");
      const store = transaction.objectStore("pendingPosts");
      const allRequest = store.getAll();

      allRequest.onsuccess = () => resolve(allRequest.result);
      allRequest.onerror = () => resolve([]);
    };

    request.onerror = () => resolve([]);
  });
}

// 移除已同步的文章
function removePendingPost(id) {
  return new Promise((resolve) => {
    const request = indexedDB.open("appDB", 1);

    request.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(["pendingPosts"], "readwrite");
      const store = transaction.objectStore("pendingPosts");
      const deleteRequest = store.delete(id);

      deleteRequest.onsuccess = () => resolve(true);
      deleteRequest.onerror = () => resolve(false);
    };
  });
}

// 通知客户端数据已更新
function notifyClientIfNeeded(request, response) {
  // 只对某些类型的请求发送通知
  if (request.url.includes("/api/notifications")) {
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "DATA_UPDATED",
          url: request.url,
          timestamp: Date.now(),
        });
      });
    });
  }
}

// cache-manager.js - 缓存管理模块
class CacheManager {
  constructor(cacheName) {
    this.cacheName = cacheName || "dynamic-cache-v1";
    this.maxEntries = 100; // 最大缓存条目数
    this.maxAge = 7 * 24 * 60 * 60 * 1000; // 7天过期
  }

  // 清理过期缓存
  async cleanup() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();
    const now = Date.now();

    for (const request of requests) {
      const response = await cache.match(request);
      if (!response) continue;

      const dateHeader = response.headers.get("date");
      if (!dateHeader) continue;

      const fetchedTime = new Date(dateHeader).getTime();
      const age = now - fetchedTime;

      if (age > this.maxAge) {
        await cache.delete(request);
        console.log("清理过期缓存:", request.url);
      }
    }

    // 如果缓存条目过多，清理最旧的
    if (requests.length > this.maxEntries) {
      const toDelete = requests.slice(0, requests.length - this.maxEntries);
      for (const request of toDelete) {
        await cache.delete(request);
      }
    }
  }

  // 获取缓存统计信息
  async getStats() {
    const cache = await caches.open(this.cacheName);
    const requests = await cache.keys();

    let totalSize = 0;
    const byType = {};

    for (const request of requests) {
      const response = await cache.match(request);
      if (response) {
        const url = new URL(request.url);
        const extension = url.pathname.split(".").pop() || "other";
        const size = (await response.blob()).size;

        totalSize += size;
        byType[extension] = (byType[extension] || 0) + 1;
      }
    }

    return {
      totalEntries: requests.length,
      totalSize: (totalSize / 1024 / 1024).toFixed(2) + " MB",
      byType,
      cacheName: this.cacheName,
    };
  }

  // 清空所有缓存
  async clearAll() {
    const cacheNames = await caches.keys();
    await Promise.all(cacheNames.map((name) => caches.delete(name)));
  }

  // 预缓存指定资源
  async precache(urls) {
    const cache = await caches.open(this.cacheName);
    const results = [];

    for (const url of urls) {
      try {
        await cache.add(url);
        results.push({ url, status: "cached" });
      } catch (error) {
        results.push({ url, status: "failed", error: error.message });
      }
    }

    return results;
  }
}

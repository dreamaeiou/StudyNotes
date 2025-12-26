/**
 * @图片懒加载
 */
const lazyObserver = new IntersectionObserver((entries, observer) => {
  entries.forEach(
    (entey) => {
      if (entey.isIntersecting) {
        const img = entey.target;
        console.log(img, img.dataset.src);
        lazyObserver.unobserve(img);
      }
    },
    {
      rootMargin: "100px 0px",
      threshold: 0.1,
    }
  );
});

class LazyLoader {
  constructor(options = {}) {
    this.options = {
      rootMargin: "100px 0px",
      threshold: 0.1,
      placeholder:
        "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7",
      ...options,
    };
    this.observer = null;
    this.init();
  }
  init() {
    this.observer = new IntersectionObserver(
      this.hanldeIntersection.bind(this),
      this.options
    );
    const lazyImages =
      document.createElement.querySelectorAll("img[dataa-src]");
    // 7. 遍历每张图片
    lazyImages.forEach((img) => {
      // 关键步骤：设置占位图
      img.src = this.options.placeholder; //设置占位符
      // 这行代码的作用：
      // 1. img.src原本是空字符串 ""
      // 2. 现在设置为一个1px透明GIF的base64编码
      // 3. 避免浏览器自动加载 data-src 的内容
      // 8. 开始观察这个图片元素
      this.observer.observe(img);
      // 告诉观察器："请帮我盯着这个img元素，
      // 当它进入检测区域时，调用handleIntersection函数"
    });
  }
  hanldeIntersection(entries) {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;

        const tempImg = new Image(); // 创建内存中的图片对象
        tempImg.onload = () => {
          // 图片加载完成时的回调
          img.src = img.dataset.src; // 此时再设置到真实img
          img.classList.add("lazy-loaded"); // 添加加载完成的样式
          this.observer.unobserve(img); // 停止观察（已加载过）
        };
        tempImg.src = img.dataset.src; // 开始预加载
      }
    });
  }
}

/**
 * @使用
 */

<img data-src="real-image.jpg" class="lazy-image"></img>;

// 1. DOMContentLoaded 事件触发
// 页面DOM结构加载完成，但图片等资源还未加载
document.addEventListener("DOMContentLoaded", () => {
  // 2. 创建LazyLoader实例
  new LazyLoader({
    rootMargin: "200px 0px", // 自定义配置
  });
});

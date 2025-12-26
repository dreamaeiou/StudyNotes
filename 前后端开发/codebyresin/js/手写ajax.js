function ajasRequest(option) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open(option.method || "GET", option.url, true);
    if (option.header) {
      for (const [key, value] of Object.entries(option.header)) {
        xhr.setRequestHeader(key, value);
      }
    }
    if (option.timeout) {
      xhr.timeout = option.timeout;
    }
    // 5. 设置响应类型
    if (option.responseType) {
      xhr.responseType = option.responseType;
    }
    xhr.onreadystatechange = function () {
      if (xhr.readyState === 4) {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve({
            data: xhr.response,
            status: xhr.status,
          });
        } else {
          reject(new Error("请求失败"));
        }
      }
    };
    const data = option.data ? JSON.stringify(option.data) : null;
    xhr.send(data);
  });
}

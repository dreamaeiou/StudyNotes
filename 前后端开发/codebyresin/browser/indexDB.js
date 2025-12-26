class IndexedDBManager {
  constructor(dbName, version) {
    this.dbName = dbName;
    this.version = version || 1;
    this.db = null;
  }

  // 1. 打开/创建数据库
  openDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = (event) => {
        console.error("数据库打开失败:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log("数据库打开成功");
        resolve(this.db);
      };

      // 首次创建或版本升级时触发
      request.onupgradeneeded = (event) => {
        console.log("数据库升级/创建");
        this.db = event.target.result;

        // 创建对象存储（类似表）
        if (!this.db.objectStoreNames.contains("users")) {
          const store = this.db.createObjectStore("users", {
            keyPath: "id",
            autoIncrement: true, // id 自增
          });

          // 创建索引
          store.createIndex("nameIndex", "name", { unique: false });
          store.createIndex("emailIndex", "email", { unique: true });
          store.createIndex("ageIndex", "age", { unique: false });
          store.createIndex("createdIndex", "created", { unique: false });
        }

        // 创建第二个对象存储
        if (!this.db.objectStoreNames.contains("products")) {
          const store = this.db.createObjectStore("products", {
            keyPath: "sku",
          });
          store.createIndex("categoryIndex", "category", { unique: false });
          store.createIndex("priceIndex", "price", { unique: false });
        }
      };
    });
  }

  // 2. 添加数据
  addData(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }
      // 开始事务（涉及两个对象存储）
      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.add({
        ...data,
        created: new Date().toISOString(),
        updated: new Date().toISOString(),
      });

      request.onsuccess = (event) => {
        console.log("数据添加成功，ID:", event.target.result);
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        console.error("数据添加失败:", event.target.error);
        reject(event.target.error);
      };
    });
  }

  // 3. 读取数据
  getData(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      const request = store.get(key);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 4. 更新数据
  updateData(storeName, data) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      // 先获取旧数据
      const getRequest = store.get(data.id);

      getRequest.onsuccess = (event) => {
        const oldData = event.target.result;
        if (!oldData) {
          reject(new Error("数据不存在"));
          return;
        }

        const newData = {
          ...oldData,
          ...data,
          updated: new Date().toISOString(),
        };

        const updateRequest = store.put(newData);

        updateRequest.onsuccess = () => {
          console.log("数据更新成功");
          resolve(newData);
        };

        updateRequest.onerror = (event) => {
          reject(event.target.error);
        };
      };

      getRequest.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 5. 删除数据
  deleteData(storeName, key) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readwrite");
      const store = transaction.objectStore(storeName);

      const request = store.delete(key);

      request.onsuccess = () => {
        console.log("数据删除成功");
        resolve(true);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 6. 查询所有数据
  getAllData(storeName) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      const request = store.getAll();

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 7. 通过索引查询
  getDataByIndex(storeName, indexName, value) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      const request = index.get(value);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 8. 使用游标查询（高级查询）
  queryWithCursor(storeName, callback) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);

      const request = store.openCursor();
      const results = [];

      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          // 调用回调函数决定是否包含该记录
          if (!callback || callback(cursor.value)) {
            results.push(cursor.value);
          }
          cursor.continue();
        } else {
          // 游标遍历结束
          resolve(results);
        }
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 9. 范围查询
  getDataByRange(storeName, indexName, range) {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error("数据库未连接"));
        return;
      }

      const transaction = this.db.transaction([storeName], "readonly");
      const store = transaction.objectStore(storeName);
      const index = store.index(indexName);

      const request = index.getAll(range);

      request.onsuccess = (event) => {
        resolve(event.target.result);
      };

      request.onerror = (event) => {
        reject(event.target.error);
      };
    });
  }

  // 10. 删除数据库
  deleteDatabase() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.deleteDatabase(this.dbName);

      request.onsuccess = () => {
        console.log("数据库删除成功");
        this.db = null;
        resolve(true);
      };

      request.onerror = (event) => {
        console.error("数据库删除失败:", event.target.error);
        reject(event.target.error);
      };

      request.onblocked = () => {
        console.warn("数据库被其他连接阻塞，请关闭所有标签页");
        reject(new Error("数据库被阻塞"));
      };
    });
  }

  // 11. 关闭数据库连接
  close() {
    if (this.db) {
      this.db.close();
      console.log("数据库连接已关闭");
    }
  }
}

/**
 * @使用
 */
async function exampleUsage() {
  const dbManager = new IndexedDBManager("MyAppDB", 2);

  try {
    // 1. 打开数据库
    await dbManager.openDatabase();

    // 2. 添加数据
    const userId = await dbManager.addData("users", {
      name: "张三",
      email: "zhangsan@example.com",
      age: 25,
      city: "北京",
    });
    console.log("用户ID:", userId);

    // 3. 查询数据
    const user = await dbManager.getData("users", userId);
    console.log("查询结果:", user);

    // 4. 更新数据
    await dbManager.updateData("users", {
      id: userId,
      age: 26,
      city: "上海",
    });

    // 5. 通过索引查询
    const userByEmail = await dbManager.getDataByIndex(
      "users",
      "emailIndex",
      "zhangsan@example.com"
    );
    console.log("通过邮箱查询:", userByEmail);

    // 6. 查询所有用户
    const allUsers = await dbManager.getAllData("users");
    console.log("所有用户:", allUsers);

    // 7. 游标查询：年龄大于20的用户
    const adults = await dbManager.queryWithCursor(
      "users",
      (user) => user.age > 20
    );
    console.log("成年人:", adults);

    // 8. 范围查询：年龄在20-30之间的用户
    const ageRange = IDBKeyRange.bound(20, 30);
    const usersInRange = await dbManager.getDataByRange(
      "users",
      "ageIndex",
      ageRange
    );
    console.log("20-30岁用户:", usersInRange);

    // 9. 删除数据
    await dbManager.deleteData("users", userId);
  } catch (error) {
    console.error("操作失败:", error);
  } finally {
    // 关闭连接
    dbManager.close();
  }
}

// 执行示例
exampleUsage();

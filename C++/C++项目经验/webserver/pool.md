## 信号量
C++本身提供**信号量**是在C++20，在此之前都是使用的C With Unix中的```sempahore.h```，奈何官网对此的描述实在是有点简陋，我没看懂。

[semaphore.h的man文档](https://pubs.opengroup.org/onlinepubs/7908799/xsh/semaphore.h.html)，但是感觉其中关于```sem_t```的具体用法没怎么说。

1. sem_t：声明一个信号量变量
2. sem_init()：对信号量进行初始化
	```cpp
	int sem_init(sem_t *sem, int pshared, unsigned int value);
	```
	- sem：需要进行初始化的信号量变量。
	- pshared：如果为0，信号量在当前进程内部使用；如果为非零值，则信号量可以在进程间共享。
	- value：初始化信号量的值
	- 返回值：0为成功，-1为失败并会设置```errno```
3. sem_destroy()：销毁信号量
	```cpp
	int sem_destroy(sem_t *sem);
	```
	- sem：需要销毁的信号量
	- 返回值：0成功，-1失败并设置```errno```
4. sem_wait()：**P操作**（荷兰语中的proberen），信号量值-1，若是为0，就阻塞等待
	```cpp
	int sem_wait(sem_t *sem);
	```
5. sem_trywait()：尝试将信号量的值减1，如果信号量的值为0，则立即返回失败
	```cpp
	int sem_trywait(sem_t *sem);
	```
6. sem_post()：**V操作**（荷兰语中的verhogen），信号量+1，如果有任何进程被阻塞在 P 操作上，这个操作将唤醒其中一个进程
	```cpp
	int sem_post(sem_t *sem);
	```
7. sem_getvalue()：获取信号量的当前值
	```cpp
	int sem_getvalue(sem_t *sem, int *sval);
	```
	- sem：信号量的指针
	- sval：接受值的指针
	- 返回值：0成功，-1失败

### 信号量的原理（这里内容目前还不是很多）
我一开始以为信号量```wait()```的原理是**自旋**，但是实际上不是，因为自旋会引起很多的问题；==信号量使用的是操作系统提供的同步机制==。

## 完美转发
[C++参考文档](https://zh.cppreference.com/w/cpp/utility/forward)
``std::forward（在头文件utility中）``的核心作用就是为了根据参数的值类别（左值或右值）选择正确的处理函数或构造函数。这种机制叫做“**完美转发**”（perfect forwarding），它允许你==在模板函数中将参数无缝地转发给其他函数，保持其原始的值类别==：
```cpp
#include <iostream>
#include <utility> // for std::forward
#include <vector>

void anotherFunction(int& value) {
    std::cout << "Lvalue reference: " << value << std::endl;
}

void anotherFunction(int&& value) {
    std::cout << "Rvalue reference: " << value << std::endl;
}

template <typename T>
void process(T&& arg) {
    // anotherFunction(std::forward<T>(arg));
    anotherFunction(arg);
}

int main() {
    int x = 10;
    process(x);        // Lvalue reference
    process(20);       // Rvalue reference
}
```
将调用部分进行更改就可以看到完美转发的作用了。

### 完美转发的原理（暂无）
完美转发涉及到模板函数中的**转发引用（万能引用）**，而我对这里不是很懂，以后有机会再补上吧（

### 源码部分以及我的疑惑
<font color="red"><b>因为对于这部分还是有很多的疑惑，因此把代码贴在这，希望以后能得到解决</b></font>：
```cpp
template<class F>
void AddTask(F&& task) {
	{
		std::unique_lock<std::mutex> locker(pool_->mtx);
		// 使用完美转发技术，主要是为了避免复制吧？
		pool_->tasks.emplace(std::forward<F>(task));
	}
	pool_->cond.notify_one();
}
```
1. 为什么要使用完美转发？
2. 完美转发的原理
3. 学习模板

## functional
[C++参考文档](https://zh.cppreference.com/w/cpp/header/functional)

这个应该是最先写的模块，因为缓冲区似乎是独立出来的。
## buffer.h
### sys/uio.h
这个头文件是Linux系统提供的用于IO操作的头文件，==sys表明它是一个系统提供的头文件==（类Unix系统提供的系统调用库似乎都是以sys开始的），==uio表明它是一个Linux中的IO库==（这个u我怀疑是Unix的意思）。
在该文件中，使用了其中的数据结构：
```cpp
struct iovec { // 意思是io vector
    void  *iov_base;  // 指向缓冲区的指针
    size_t iov_len;   // 缓冲区的长度
};
```
和关于该数据结构的两个函数：
```cpp
ssize_t readv(int fd, const struct iovec *iov, int iovcnt);
ssize_t writev(int fd, const struct iovec *iov, int iovcnt);
```
使用**iovec**的好处在于：==这两个函数能将一个文件描述符中的数据同时读/写到多个缓冲区中==。

### ssizze_t和size_t的使用
在Buffer中，有很多在平时编写简短代码中不太常见的内容，如：**size_t**和**ssize_t**，这都是为了保证程序的可移植性，<font color="red">使用size_t作为函数返回值是为了和vector的size()匹配，而ssize_t则是因为和系统API进行了交互</font>。
> ssize_t往往被声明为**signed int**

#### 函数编写建议
因为上面这些小知识点，我们就能够得到一个结论：
1. ssize_t：用于需要表示负值的场景，通常与系统API交互时，特别是在处理可能失败的操作和错误码时。
2. size_t：用于处理不可能是负数的情况，如数组大小、容器容量和索引。

如果在编写程序的时候能够注意这些小问题，就能够提高我们编写的程序的可移植性。

### 关于调用系统调用
这个问题是源于Buffer的读写函数中：
```cpp
ssize_t ReadFD(int fd, int* Errno);
ssize_t WriteFD(int fd, int* Errno);
```

> [!问题描述]
> 系统调用不是会自动对一个全局变量errno进行设置吗？为什么这里还需要传入一个由我们维护的`int* Errno`？
> 

这是因为errno是一个**全局变量**，WebServer是一个多线程程序，==在多线程中，直接使用errno很容易就会产生数据竞争的问题，而在单线程中，我们直接使用errno是没问题的==。

### atomic的使用
[C++参考手册](https://zh.cppreference.com/w/cpp/atomic/atomic)其中有对atomic的详细描述，包括了C++20的，WebServer使用的标准好像是C++14，并没有用到20。

atomic的操作其实不算多：
```cpp
#include <atomic>
std::atomic<int> example(100); // 定义一个int类型的atomic变量，并且将其值初始化为100
exampe = store(50); // 将值原子地变更为50
int value = example.load() // 读取值
```
以上是比较基础的用法，还有```exchange()```、```compare_exchange_weak()```、```compare_exchange_strong```和```is_lock_free()```我这没说，我看了下感觉我用不上。

### 断言的使用
```cpp
#include <cassert>
assert(condition);
```
==当传入的condition为false的时候，断言就会被触发，它会调用abort()函数，终止程序的运行==。

assert的行为是可以被控制的，若是不想更改代码，同时又不希望assert被使用，可以定义一个宏：```#define NDEBUG```：
> 在宏NDEBUG被声明的时候，assert不会被启用，即使它在2代码中被使用，也不会有任何行为。

这里我就发现很有意思的一点：
```cpp
#define NDEBUG

#include <assert.h>
```
这种情况下，```NDEBUG```才是有效的；若是define的声明在头文件导入之后，这个宏就不会起作用了，这是因为在头文件定义的时候就定义了这一点，我看了下```asseert.h```中的内容，发现了如下两行：
```cpp
If NDEBUG is defined, do nothing.
If not, and EXPRESSION is zero, print an error message and abort.
```
其中就提到了NDEBUG的用法。

这个现象的解释就是在include之后它会检查之前是否有define过该宏。

### vector中的clear()
```cpp
void Buffer::RetrieveAll() {
    // bzero(&buffer_[0], buffer_.size());
    /*
      原版使用的是上面的注释部分
      但是这部分GPT说已经不建议使用了
      因为不符合C语言的编写标准
    */
    memset(&buffer_[0], 0, buffer_.size());

    readPos_ = 0;
    writePos_ = 0;
}
```

### 迭代器的更深入理解
[C++参考手册](https://zh.cppreference.com/w/cpp/iterator)中说到：迭代器就是更为广义上的指针。所以它的使用和指针其实差不多，但是为什么我会写这个呢？
```cpp
char* Buffer::BeginPtr_() {
    return &*buffer_.begin();
}
```
主要是这段代码在我一开始看的时候感觉有点莫名其妙，有点不是很理解为什么要这么写。但现在就能较好的说明它了：
> [!解释]
> 对于begin()都很清楚返回值是一个迭代器，而==迭代器是一个抽象的指针==，它重载了指针的所有操作（解引用和取地址），并且效果和操作指针是一样的，但是迭代器毕竟不是指针。
> 
> ```arr.begin()```就是获得arr的首部迭代器，而对其进行解引用就是获得arr的首部值，即：arr[0]，再对其解引用就得到了头部的地址

### string.data()
这个函数我一直都没怎么用过，因为我觉得这部分直接使用C语言的写法会更好一点，==data()获得的是string的首部元素的地址==，具体如下：
```cpp
void Buffer::Append(const std::string& str) {
    Append(str.data(), str.size());
}
```
其实这段代码如果是我要写的话我应该会直接写```&str[0]```，但是从代码的编写规范来说，我的写法是不那么“现代化C++”的，所以还是使用data()更好点。

### static_cast
==static_cast本身不会丢弃原对象的const和volatile属性==：
```cpp
const int num = 10;
int temp = static_cast<int>(num);
temp = 12;
```
这里涉及到两个知识点：
- static_cast 只是类型转换：
	- static_cast 进行的是类型转换，并不改变原始数据的 const 限制。它只是将 num 的值传递到 temp 中，temp 在这个过程中并不继承 const 限制。
- const 限制在原始对象中有效：
	- const 限制仅对原始对象有效。在上面的例子中，num 是 const，所以你不能修改 num。但 temp 是一个新的 int 变量，它不受 num 的 const 限制影响。

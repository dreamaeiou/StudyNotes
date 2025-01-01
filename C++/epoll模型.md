## epoll介绍
==epoll是Linux中特有的一个IO复用模型，它能够高效地处理大量的并发连接==。
由于epoll是Linux系统提供的，因此需要使用头文件**sys/epoll.h**。

在之前已经介绍了两个IO复用模型：**select**和**poll**，相比起这两个IO复用模型，epoll相对更复杂一点。

epoll主要可以分为以下步骤：
1. 调用**epoll_create**创建一个**句柄**，返回一个文件描述符用于后续的操作
2. 调用**epoll_ctl**函数向epoll句柄（就是刚刚使用epoll_create创建的文件描述符）中==注册感兴趣的事件==。通过epoll_ctl增加、修改、删除监视的文件描述符以及对应的事件类型。包括EPOLLIN等（==就是poll中的事件对应加上E==）
3. 调用**epoll_wait**等待事件发生。epoll_wait会阻塞程序运行，直到有文件描述符上注册的事件发生或超时。一旦有事件发生，epoll会返回发生的事件的文件描述符以及其对应的事件类型
4. 处理触发的事件。通过返回的文件描述符，应用程序可以进行相对应的操作，比如读取或者写入数据

相比起其他的IO多路复用机制（例如select和poll），epoll有以下优点：
1. 基于回调机制：epoll采用基于回调的方式，只有活跃的文件描述符才会调用回调函数，避免了遍历整个描述符集合
2. 支持**边缘触发ET**（Edge-Triggered）和**水平触发LT**（Level-Triggered）两种模式：边缘触发模式只在状态变化（如不可读变为可读）时通知，而水平触发模式则在状态仍有效（可读或可写）时就会通知
	1. 支持大量的并发连接：epoll使用<font color="red"><b>红黑树</b></font>和<font color="red"><b>双端队列</b></font>的数据结构，在处理大量并发连接时，性能更好

在select和poll中，我们只需使用select/poll一个函数就能够完成任务，而epoll则提供了一系列函数，在上文中我们就提到了：

| 函数名称 | 作用 |
| :--: | :--: |
| epoll_create | 创建一个文件描述符，用于存储**事件表** |
| epoll_ctl | 操作epoll的内核事件表 |
| epoll_wait | 在一段超时时间内等待一组文件描述符上的事件 |

<font color="red"><b>接下来，我们就按照顺序，一个个说说它们的使用和一些细节。</b></font>

## epoll_create
在select/poll中，我们每次调用都需要传入**文件描述符集**或者**事件集**，但是在epoll中，我们使用了一个**事件表**将我们关注的那些事件存储起来，==这个事件表需要使用一个额外的文件描述符来标识==。
而epoll_create的作用就是==创建这个文件描述符==。
```cpp
#include <sys/epoll.h>

int epoll_create(int size);
int epoll_create1(0); // 参数是一个flag，一般设置为0即可，详细可以看man epoll
```
- size：目前来说没有任何作用，仅仅是提示内核这个事件表需要多大，==传入一个大于0的数即可==
- 返回值：就是这个epoll事件表的文件描述符

## epoll_ctl
这个ctl需要知道是control的缩写，有个操作文件和文件描述符的头文件叫做**tcntl.h**（file control）也是一样的道理。
我们在创建了事件表后，它其实是空的，我们对事件表中的数据进行操作就要使用这个函数：
```cpp
#include <sys/epoll.h>

int epoll_ctl(int epfd, int op, int fd, struct epoll_event* event);
```
- epfd：事件表的文件描述符
- op：指定操作类型（operate），有三种：**EPOLL_CTL_ADD**（向事件表中注册fd上的事件）、**EPOLL_CTL_MOD）**（修改fd上的事件）、**EPOLL_CTL_DEL**（删除fd上注册的事件）
- fd：要操作的文件描述符（<font color="skyblue"><b>这个还没太理解</b></font>）
- event：指定事件，是**epoll_event**指针类型。这个类型后面会细说。
```cpp
epoll_ctl(epfd, EPOLL_CTL_ADD, sockfd, &ev);    //添加事件到epoll
epoll_ctl(epfd, EPOLL_CTL_MOD, sockfd, &ev);    //修改epoll红黑树上的事件
epoll_ctl(epfd, EPOLL_CTL_DEL, sockfd, NULL);   //删除事件
```

==epoll_ctl成功时返回0，失败时返回-1并设置errno==。

### epoll_event结构体（没搞懂）
在epoll_ctl函数中，最后一个参数使用的是此类型，我们先来看看它的定义：
```cpp
#include <sys/epoll.h>

struct epoll_event{
	__uint32_t events; // epoll事件
	epoll_data_t data; // 用户数据
};
```
- events：该成员==描述事件类型==，==epoll支持的事件类型和poll所支持的事件类型基本相同==，只是相对应的将”POLL“改为”EPOLL“，但是epoll有两个额外的事件：**EPOLLET**和**EPOLLONESHOT**，这两个事件对于epoll的高效十分关键，后面细说。
- data：该成员用于==存储用户数据==（<font color="skyblue"><b>不是很理解什么是用户数据</b></font>）

我们再来看看epoll_data_t的定义：
```cpp
typedef union epoll_data{
	void* ptr;
	int fd;
	uint32_t u32;
	uint64_t u64;
}epoll_data_t
```
这是一个**联合体**，这里刚好复习一下什么是联合体。
> 联合体是一种特殊的数据结构，它允许在同一内存位置储存不同的数据类型。
> 这也是它和struct不同的地方，联合体中所有成员共享相同的内存空间，其大小取决于其最大成员的大小。
> 联合体的数据读取是==根据该类型所占用的内存大小来解析的，这里可以给出一个示例：

```cpp
#include <iostream>
using namespace std;
union Data{
    int age;
    int id;
    char name[4];
};
int main(){
    Data stu;
    stu.age = 10;
    stu.id = 65;
    cout << stu.age << " " << stu.id << " " << stu.name << endl;
}
```
这段代码的运行结果为：
```powershell
65 65 A
```
这个例子能很好的说明这一点。

在epoll_data_t的四个成员中，使用最多的是fd，==它指定的事件所从属的目标文件描述==；ptr可用来指定与fd相关的用户数据。
> 但由于epoll_data_t是一个联合体，我们不能同时使用ptr和fd。如果要将文件描述符和用户数据关联起来，就只能使用其它手段。


## epoll_wait
这个函数是epoll系统函数的主要接口，它在==一段超时时间内等待一组文件描述符上的事件==，其原型如下：
```cpp
#include <sys/epoll.h>

int epoll_wait(int epfd, struct epoll_event* events, int maxevents, int timeout);
```
该函数成功时返回==就绪的文件描述符的个数==，失败时返回-1并设置errno。
- timeout：和poll接口的timeout参数一致
- maxevents：指定监听事件的最大数，必须大于0

> epoll_wait函数如果检测到事件，就将所有就绪的事件从内核事件表（由epfd参数指定）中复制到它的第二个参数events指向的==数组==中。
> 这个数组值用于输出epoll_wait检测到的就绪事件，而不像poll和select的数组那样，既用于传入用户注册的事件，又用于输出内核检测到的就绪事件。==这样就极大地提高了应用程序索引就绪文件描述符的效率==。

```cpp
/*
	poll和epoll在使用上的差别
*/


// poll
int ret = poll(fds, MAX_EVENT_NUMBER, -1);
// 必须遍历所有已注册文件描述符并找到其中的就绪者
for(int i=0; i<MAX_EVENT_NUMBER; i++){
	if(fds[i].revents & POLLIN){
		int sockfd = fds[i].fd;
		/* 处理 */
	}
}


// epoll
int ret = epoll_wait(epollfd, events, MAX_EVENT_NUMBER, -1);
// 只需要遍历就绪的ret个文件描述符
for(int i=0; i<ret; i++){
	int sockfd = events[i].data.fd;
	// sockfd肯定就绪，直接处理
}
```

## epoll的两种触发模式：LT和ET
epoll对文件描述符的操作又两种模式：<font color="pink"><b>LT（Level Trigger，电平触发）</font></b>模式和<font color="pink"><b>ET（Edge，边沿触发）</font></b>模式。
==LT是epoll的默认工作模式，这种模式下epoll相当于一个效率较高的poll==。当往epoll内核事件表中注册一个文件描述符上的EPOLLET事件时，epoll将以ET模式来操作该文件描述符。<font color="red"><b>ET模式是epoll的高效工作模式</b></font>。
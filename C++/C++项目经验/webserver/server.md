## epoll
``epoll``是Linux下特有的**I/O事件通知机制**，比传统的``poll``和``select``更加高效。

``epoll``由事件驱动，即：==当发生了``epoll``感兴趣的IO事件后，``epoll``将会被通知==。

### epoll的使用流程
1. 使用``epoll_create``创建**epoll实例**（一个文件描述符，因为Linux中万事万物皆文件）：
	```cpp
	#include <sys/epoll.h>
	/*
	epoll_create() creates a new epoll(7) instance.  Since Linux 2.6.8, the size argument is ignored, but must be greater than zero; see NOTES.
	*/
	int ep_fd = epoll_create(1);
	```
2. 使用``epoll_ctl``对epoll感兴趣的事件和文件描述符进行操作：
	- ``EPOLL_CTL_ADD``：添加文件描述符
	- ``EPOLL_CRL_MOD``：修改文件描述符
	- ``EPOLL_CTL_DEL``：删除文件描述符
	```cpp
	struct epoll_event event;
    event.events = EPOLLIN; // 关注的事件
    event.data.fd = sockfd; // 关注的文件描述符
    epoll_ctl(epfd, EPOLL_CTL_ADD, sockfd, &event);
	```
3. 使用``epoll_wait``等待事件发生（轮询）：
	```cpp
	struct epoll_event events[MAX_EVENTS];
	int n = epoll_wait(epfd, events, MAX_EVENTS, timeout);
	for (int i = 0; i < n; i++) {
	    // 处理就绪事件
	}
	```

### epoll的事件处理逻辑
1. ``EPOLLIN``：可读事件，文件描述符上有数据可读
2. ``EPOLLOUT``：可写事件，文件描述符上有数据可写
3. ``EPOLLERR``：发生错误，如关闭连接

这只是部分逻辑，EPOLL的设置有很多。

### 和epoll相关的数据结构
1. ``epoll_event``：用于存储``epoll``关注的文件描述符和该文件描述符上关注的事件：
	```cpp
	typedef union epoll_data
	{
	  void *ptr;
	  int fd;
	  uint32_t u32;
	  uint64_t u64;
	} epoll_data_t;
	
	struct epoll_event
	{
	  uint32_t events;	/* Epoll events */
	  epoll_data_t data;	/* User data variable */
	};
	```
	（<font color="red"><b>这两个结构结合起来看</b></font>）

### epoll_wait函数中的细节
可以发现，在对已经就绪的事件进行处理的时候使用的是``for循环``，因此很容易就能猜到：==``epoll_wait``在内部会调整传入的events数组中元素的顺序，将已经就绪的事件放到数组的开头==，这样我们才能对其进行处理。

### epoll的两种触发模式

## 阻塞IO和非阻塞IO


## 常量引用可以接收任何值！
什么是**常量引用**？
```cpp
const T& temp;
```
这种就是常量引用。

==常量引用可以被绑定到任何值==（包括左值和右值），而==左值引用只能绑定到可以被修改的左值==。

## Linux中文件的细节（可能还需要斟酌和修改）
有一段代码我当初一直没怎么看懂：
```cpp
void WebServer::OnProcess(HttpConn* client) {
    // 对报文进行解析：
    //      解析请求报文的同时，生成相应报文
    // 成功读取并生成了相应报文，重新注册写事件
    if(client->process()) {
        epoller_->ModFd(client->GetFd(), connEvent_ | EPOLLOUT);
    } 
    // 没有可读数据，重新注册读事件
    else {
        epoller_->ModFd(client->GetFd(), connEvent_ | EPOLLIN);
    }
}
```
这段代码是对``HttpConnection``的一段处理，我的疑惑在于：
> 为什么在处理之后需要对``epoller``关注的事件重新进行注册？对于关注的事件，我们又是怎么知道它已经被触发了？

我们都知道，``EPOLLIN``是对可读事件的关注，``EPOLLOUT``是对可写事件的关注；但是可能不清楚：==为什么系统能对文件的状态进行监控？这又是何如做到的呢？==

Linux系统中的所有文件都具有**缓冲区**，这里就拿网络编程来说明：
当有数据发送至该文件描述符的时候，数据先会尽可能得存储至缓冲区中，若是我们没有调用``readv``这类的函数，默认情况下将会发生阻塞，直到你对这个缓冲区中的数据进行了处理（除非设置了文件的IO为**非阻塞Non-Block**），在你将缓冲区中的数据处理完成、并且缓冲区中不再有数据流入，此时缓冲区中的数据应当是完全处于文件中了，此时就处于**有数据可读**的状态，类似的``EPOLLOUT``也是类似的。

<font color="red"><b>所以，了解、理解缓冲区的行为是十分重要的</b></font>。

至于为什么需要重新注册事件？这个是和epoll的行为有关，将在[[#epoll]]中补充，<font color="red"><b>据AI说是和epoll的触发模式有关系</b></font>。

## 端口复用
``setportopt``
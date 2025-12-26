# 最简单server程序
```cpp
#include <iostream>

// sys（系统）,socket（套接字），这个还是挺好理解的
#include <sys/socket.h>

#include <arpa/inet.h>

#include <stdio.h>
#include <string.h>

int main(){
	// 创建一个套接字描述符，这个描述符本质上就是一个Linux的文件描述符
	int socketfd = socket(AF_INET, SOCK_STREAM, 0);

	struct sockaddr_in serv_addr;
	bzero(&serv_addr, sizeof(serv_addr));
	serv_addr.sin_family = AF_INET;
	 // s_addr就是用来存储32位IPV4地址的
	serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
	// 开启服务器的8888端口，问题是这个hton是什么
	// hton是一个将主机字节序（host byte order）的端口号转换为网络字节序（network byte order）
	serv_addr.sin_port = htons(8888);

	/*
		bind首先绑定套接字的文件描述符
		后者将传入的serv_addr强制转换为一个sockaddr类型的指针
		也就是将sockaddr_in强制转换为sockaddr
		这是因为后者是通用套接字结构体，而前者是专属于IPv4的
		由此可知：网络套接字实际上是基于通用套接字的
	*/
	bind(socketfd, (sockaddr*)&serv_addr, sizeof(serv_addr));

	// 后者是一个常量，表示监听队列的最大长度(可同时处理的最大连接数)
	listen(socketfd, SOMAXCONN);

	struct sockaddr_in clnt_addr;
	/*
		初始化一个socklen_t类型的变量，其值为clnt_addr的大小
		这个类型是一个无符号整型，用于表示套接字地址结构体的长度
	*/
	socklen_t clnt_addr_len = sizeof(clnt_addr);
	bzero(&clnt_addr, clnt_addr_len);

	int clnt_sockfd = accept(socketfd, (sockaddr*)&clnt_addr, &clnt_addr_len);

	/*
		inet_ntoa是将将一个 32 位的 IPv4 地址从网络字节序转换为点分十进制的IP地址字符串
		ntohs用于将网络字节序转换为主机字节序
		在这里就是将看不懂的内容转换为我们能看得懂的东西
	*/
	printf("new client fd %d IP: %s Port: %d\n", clnt_sockfd, inet_ntoa(clnt_addr.sin_addr), ntohs(clnt_addr.sin_port));

	return 0;
}
```
基本所有的知识点我都写在其中了，有些基础性的东西需要大家自己去学习”计算机网络“的相关知识，至于为什么在使用accept等函数的时候，需要将sockaddr_in转换成sockaddr，这点需要看书：游双的《Linux高性能服务器编程》，在其中的第五章第一节：socket地址API中有详细讨论。
接下来我们看看其中使用到的头文件：**sys/inet.h和arpa/inet.h**。

### sys/socket.h
==这个头文件是网络编程的核心头文件之一==，它包含了一些用于网络贬称搞到常量、数据结构和函数原型。这里指出一些常用的：
#### 常量
- AF_INET：表示IPv4地址族
- AF_INET6：表示IPv6地址族
- SOCK_STREAM：表示TCP套接字类型
- SOCK_DGRAM：表示UDP套接字类型
- SO_REUSEADDR：表示允许套接字地址重用

#### 数据结构
- sockaddr_in：用于储存IPv4地址和端口号的结构体
- aockaddr_in6：用于存储IPv6地址和端口号的结构体
- sockaddr：用于通用的套接字地址结构体

#### 函数
与网络通信的一系列API都在其中：
- socket()：用于创建套接字
- bind()：用于将套接字绑定到指定的地址和端口
- listen()：用于监听套接字上的连接请求
- accept()：用于接收连接请求并创建新的套接字，用于与客户端通信
- connect()：用于发起连接请求，并与服务器建立连接
- sned()/sendto()：用于发送数据
- recv()/recvfrom()：用于接收数据
- close()：用于关闭套接字

<font color="red"><b>这些函数并不是sys/socket.h中的全部，这里只写了比较基础的、常用的，还有很多的内容在netinet/in.h头文件中</b></font>。

### arpa/inet.h
在上面，我们提到了头文件**netinet/in.h**，这个头文件包含在**arpa/inet.h**中，因此我们使用了这个头文件就可以不用再次包含。它也包含了许多网络通信相关的常量、结构体、函数。

#### 常量
- INADDR_ANY：表示任意地址，用于将套接字绑定到所有可用的网络接口
- INADDR_LOOPBACK：表示回环地址，即：127.0.0.1，用于本地回环测试和通信
- INADDR_BROADCAST：表示广播地址，用于向同一网络中的所有主机发送数据

#### 数据结构
- in_addr：IPv4地址的结构体，定义为struct in_addr。该结构体包含一个字段**s_addr**，用于存储32位的IPv4地址

#### 函数
- inet_addr()：将一个表示IPv4地址的字符串转换为对应的32位无符号整数，返回网络字节序表示的IPv4地址
- inet_addr()：将一个32位无符号整数表示的IPv4地址转换为对应的**点分十进制**字符串表示
- inet_pton()：将一个IPv4或IPv6地址的字符串表示转换为对应的二进制格式，并储存到指定的地址结构体中
- inet_ntop()：将一个二进制格式的IPv4或IPv6地址转换为对应的字符串表示

## 第一个C/S应用
### 源代码
server.cpp：
```cpp
#include <stdio.h>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <string.h>
#include <unistd.h>
#include "util.h"

int main() {
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    errif(sockfd == -1, "socket create error");

    struct sockaddr_in serv_addr;
    bzero(&serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    serv_addr.sin_port = htons(8888);

    errif(bind(sockfd, (sockaddr*)&serv_addr, sizeof(serv_addr)) == -1, "socket bind error");

    errif(listen(sockfd, SOMAXCONN) == -1, "socket listen error");
    
    struct sockaddr_in clnt_addr;
    socklen_t clnt_addr_len = sizeof(clnt_addr);
    bzero(&clnt_addr, sizeof(clnt_addr));

    int clnt_sockfd = accept(sockfd, (sockaddr*)&clnt_addr, &clnt_addr_len);
    errif(clnt_sockfd == -1, "socket accept error");

    printf("new client fd %d! IP: %s Port: %d\n", clnt_sockfd, inet_ntoa(clnt_addr.sin_addr), ntohs(clnt_addr.sin_port));
    while (true) {
        char buf[1024];
        bzero(&buf, sizeof(buf));
        ssize_t read_bytes = read(clnt_sockfd, buf, sizeof(buf));
        if(read_bytes > 0){
            printf("message from client fd %d: %s\n", clnt_sockfd, buf);
            write(clnt_sockfd, buf, sizeof(buf));
        } else if(read_bytes == 0){
            printf("client fd %d disconnected\n", clnt_sockfd);
            close(clnt_sockfd);
            break;
        } else if(read_bytes == -1){
            close(clnt_sockfd);
            errif(true, "socket read error");
        }
    }
    close(sockfd);
    return 0;
}
```
client.cpp：
```cpp
#include <iostream>
#include <sys/socket.h>
#include <arpa/inet.h>
#include <stdio.h>
#include <string.h>
#include <unistd.h>
#include "util.h"

int main(){
    int sockfd = socket(AF_INET, SOCK_STREAM, 0);
    errif(sockfd == -1, "socket create error");

    struct sockaddr_in serv_addr;
    bzero(&serv_addr, sizeof(serv_addr));
    serv_addr.sin_family = AF_INET;
    serv_addr.sin_addr.s_addr = inet_addr("127.0.0.1");
    serv_addr.sin_port = htons(8888);
    
    errif(connect(sockfd, (sockaddr*)&serv_addr, sizeof(serv_addr)) == -1,
        "socket connect error");

    while(true){
        char buf[1024];
        bzero(&buf, sizeof(buf));
        scanf("%s", buf);
        ssize_t write_bytes = write(sockfd, buf, sizeof(buf));
        if(write_bytes == -1){
            printf("socket already disconnected, can't write any more!\n");
            break;
        }
        bzero(&buf, sizeof(buf));
        ssize_t read_bytes = read(sockfd, buf, sizeof(buf));
        if(read_bytes > 0){
            printf("message from server: %s\n", buf);
        }
        else if(read_bytes == -1){
            close(sockfd);
            errif(true, "socket read error");
        }
        else if(read_bytes == 0){
            printf("server socket disconnected!\n");
            break;
        }
    }
    close(sockfd);
    return 0;
}
```
Makefile：
```makefile
# shell和Makefile有点像
build:
	make client;
	make server

client: client.cpp util.cpp
	g++ -o client client.cpp util.cpp

server: server.cpp util.cpp
	g++ -o server server.cpp util.cpp

clean:
	rm -f server client
```
util.h：
```cpp
#ifndef UTIL_H
#define UTIL_H

void errif(bool, const char*);

#endif
```
util.cpp：
```cpp
#include "util.h"
// #include <unistd.h>
#include <stdio.h>
#include <stdlib.h>

void errif(bool condition, const char* errmsg){
    if(condition){
        perror(errmsg);
        exit(EXIT_FAILURE);
    }
}
```

### unistd.h
unistd.h 是C语言标准库中的一个头文件，它提供了对POSIX（可移植操作系统接口）的访问。==其中包含了许多函数和符号常量，用于进程控制、文件操作、目录操作等方面的功能，主要用于访问操作系统的底层功能==。
从头文件名字我们就能够看出，<font color="red"><b>这个头文件只有在类UNIX系统中才能使用</b></font>。

#### 常用函数
- fork()：创建一个新进程
- exec()系列函数:用于执行新的程序文件。例如：execl()，execv()，execle()等
- exit()：使当前进程退出
- sleep()：使当前进程退出一段时间
- access()：检查文件的访问权限
- chdir()：改变当前工作目录
- getpid()：获取当前进程的PID
- getuid()：获取房前用户的用户ID
- open()：打开一个文件
- close()：关闭一个已打开的文件

由于在Linux中：”==万事万物皆文件==“，因此，我们操作进程间通信实际上就是对文件进行操作。
在上面的代码中：我们使用了该头文件中的**write**和**read**来进行网络接口的数据读写操作。

### stdlib.h
这个头文件提供了一系列通用函数，有很多常用的：
1.  内存分配和释放：**malloc、calloc、realloc、free**等函数用于动态分配和释放内存
2. 伪随机数生成：**rand、srand**函数用于生成伪随机数（伪随机数是基于某个初始种子按照一定算法生成的数值序列）
3. 字符串转换：atoi、atof、strtol、strtod等函数用于将字符串转换为相应的数值类型
4. 排序和查找：qsort、bsearch函数用于排序和查找数组中的元素
5. 程序终止和退出：exit、atexit函数用于程序的终止和退出操作
6. 环境变量处理：getenv、putenv、setenv、unsetenv等函数用于获取、设置和删除环境变量
7. 命令行参数处理：argc和argv用于处理程序的命令行参数
8. 日期和时间处理：**time、asctime、localtime、strftime**等函数用于获取和格式化日期和时间
9. 数学函数：abs、labs、sqrt、sin、cos、exp等函数用于执行基本的数学运算
10. 文件操作：fopen、fclose、fgetc、fputc等函数用于文件的打开、关闭和读写操作

在这里，我们使用了**exit**用于程序退出，并使用了**EXIT_FAILURE**（**表示程序异常终止时的退出状态码**）作为参数，这两个都是该头文件中定义的。
<font  color="red"><b>需要注意的是，EXIT_FAILURE 并不是标准规定的具体数值，只要是非零值都可以被用作异常退出的状态码。通常情况下，0 被视为正常退出状态码，而非零值则用于表示异常情况。</b></font>
### server和client需要做的操作
- 服务端：
	1. 创建套接字**socket**
	2. **bind**()绑定IP地址，Port等相关信息，在本例中是使用的IPv4，因此使用的是sockaddr_in
	3. 开始监听**listen**
	4. 创建一个与客户端进行连接的**socket**，使用**accept**接收客户端的连接
	5. 使用**read**读取客户端传递的信息，并使用**write**向客户端返回信息
	6. 使用**close**断开连接（关闭套接字）
- 客户端：
	1. 创建套接字**socket**
	2. 使用**connect**与服务端进行连接
	3. 使用**write**发送信息，使用**read**读取收到的信息
	4. 使用**close**关闭套接字

#### 关于read、write和recv、send
==接收和发送信息不仅仅能使用read和write==，这两个函数主要是用于==读取文件或标准输入等普通I/O操作==。
在网络编程中提供了相关的函数，分别是：**recv**和**send**，这里给出它们的函数声明：
```cpp
#include <sys/types.h>
#include <sys/socket.h>

/*
	这个ssize_t是long int（长整型）
	它为4或8字节，至少有int大
	跟C++的long long还是有区别的，long long至少是8字节
	也是说，long long至少有long int这么大
*/
ssize_t send(int sockfd, const void *buf, size_t len, int flags);
ssize_t recv(int sockfd, void *buf, size_t len, int flags);
```

### 细节解析
阅读server.cpp（服务端）源码，我们能够发现：==我们一开始创建的socket只用于监听，而在与客户端连接的时候我们并没有使用这个socket==：
```cpp
	// bind绑定sockfd，并使其处于监听状态
    errif(bind(sockfd, (sockaddr*)&serv_addr, sizeof(serv_addr)) == -1, "socket bind error");
    errif(listen(sockfd, SOMAXCONN) == -1, "socket listen error")


	// 使用accept接收客户端发来的连接请求
	int clnt_sockfd = accept(sockfd, (sockaddr*)&clnt_addr, &clnt_addr_len);
```
可能我们需要看看accept的声明：
```cpp
extern int accept (int __fd, __SOCKADDR_ARG __addr,
		   socklen_t *__restrict __addr_len);
```
可以发现它的返回值是个int类型，而Linux中，文件描述符也正好是个int类型，在查询资料后证实，==accept其实是新开了个文件描述符，用于维持和客户端的通信==。我们需要通过这个文件描述符进行网络通信。
套接字可以分为两种类型：**监听套接字**和**连接套接字**，我们bind的就是监听套接字，accept所创建的文件描述符就是连接套接字，==连接套接字才是真正用来网络通信的的==。

## IO复用
在说接下来的内容之前，先要说说什么是**IO复用**：
IO复用，也被称为**事件驱动IO**，是==一种高效处理多个IO事件的机制==。它允许==在一个线程中同时监听多个IO操作，而不需要为每个IO操作创建一个独立的线程==。
在传统的IO编程中，为每个客户端连接创建一个线程或进程进行处理，会导致系统资源消耗过大，限制了系统的可拓展性。而IO复用采用一个线程管理多个IO事件，通过监听多个文件描述符（通常使用**非阻塞IO套接字**）的状态变化来处理并发IO请求。
IO复用通常使用以下几个系统调用来实现：
- select：传统而普遍支持IO复用函数，能够同时监听多个文件描述符的状态变化
- poll：与select类似，但使用更高效的数据结构来处理大量文件描述符
- epoll：==Linux特有==，通过事件驱动的方式处理大量文件描述符
- kqueue：BS、MacOS X特有，类似于epoll，具有高性能的IO事件通知机制

通过使用IO复用，可以更有效地利用系统资源，提高IO处理的效率和并发能力。它广泛运用于网络服务器、操作系统内核、图形化界面等许多领域。

## select模型
select是Linux下的一个I**O复用模型**，同时，它也是Linux中一个系统函数的名称：
```cpp
#include <sys/select.h>

int select(int ndfs, fd_set* readfds, fd_set* writefds, fd_set* exceptfds, struct timeval* timeout);
```
select系统函数的用途是：
>==在一段指定时间内，监听用户感兴趣的文件描述符上的可读、可写和异常等事件==

我们先对这个函数的各个参数进行一个解释：
- ndfs：指定被监听的文件描述符的总数
- resdfds、writefds、exceptfds：分别指向可读、可写和异常事件所对应的文件描述符
- timeout：设置时间，若是NULL将会一直阻塞，直到某个文件描述符就绪

> select成功时返回[[#文件描述符的就绪状态|就绪（可读、可写和异常）文件描述符]]的总数。如果在超时时间内没有任何文件描述符就绪，select将返回0。
> select失败时返回-1并设置errno。
> 如果在程序等待期间，程序收到信号（例如Ctrl+C这种，可由函数kill发起，这点在Linux系统编程中有说到），则select会立即返回-1，并设置errno为**EINTER**（这是在errno.h中定义的一个错误代码，意思是：“Interrupted system call”，即：系统调用被中断

#### fd_set结构体
fd_set结构体的实质其实是：==一个存放文件描述符**状态**的数组==，它的定义类似于以下结构：
```c
typedef struct {
    long fds_bits[FD_SETSIZE / (8 * sizeof(long))];
} fd_set;
```
这个数组的长度由**FD_SETSIZE**决定。现在，我们对这个数组进行一个更详细的解释。
这里给出fd_set的完整定义：
```c
#include <typesizes.h>
/*
	文件描述符的最大数量
*/
#define __FD_SETSIZE 1024
#include <sys/select.h>
// 这个好像没啥用
#define FD_SETSIZE__FDFDSETSIZE
/*
	给long int取个别名叫__fd_mask
	这个类型的占用未4或8字节，具体看编译器和架构
*/
typedef long int __fd_mask;
// 取消宏定义，可能是为了防止宏定义冲突
#undef __NFDBITS
/*
	重新设定__NFDBITS
	————NFDBITS计算的是__fd_maks所占的位数
*/
#define __NFDBITS (8*(int)sizeof(__fd_mask))
typedef struct{
	#ifdef __USE_XOPEN
	__fd_mask fds_bits[__FD_SETSIZE/__NFDBITS]
	#define __FDS_BITS(set((set)->fds_bits))
	#else
	__fd_mask fd_bits[__FD_SETSIZE/__NFDBITS];
	#define __FDS_BITS(set)((set)->__fds_bits)
	#endif
}fd_set
```
从上面这段代码可以知道：==fd_set数组所占用的bit的数量其实就是__FD_SETSIZE/8==。
这是因为：<font color="red"><b>fd_set的本质是位图</b></font>，即：它不直接存储文件描述符，而是根据其中每一位的存储情况来确定某一文件描述符的状态。![[img/fd_set位图.png]]
具体如下：
- 位图的索引（数组的下标）对应文件描述符的编号，即第0位对应文件描述符0，第1位对应文件描述符1，以此类推
- 位图的值表示对应的文件描述符的状态。如果位值位1，表示该文件描述符需要监视；若是0，则表示该文件描述符不需要监视

由于fd_set中的操作本质上是位操作，我们想要进行操作会十分的复杂，因此我们应当==使用其提供的一系列宏来访问fd_set中的位==：
```cpp
#include <sys/select.h>
/*
	清除fdset中的所有位
*/
FD_ZERO(fd_set* fdset);
/*
	设置fd_set中的位fd
*/
FD_set(int fd, fd_set* fdset);
/*
	清除fdset中的位fd
*/
FD_CLR(int fd, fd_set* fdset);
/*
	测试fdset的位fd是否被设置
*/
int FD_ISSET(int fd, fd_set* fdset);
```

### timeval结构体
在上面的select系统函数中，最后一个参数就是一个**timeval**结构体**指针**，它用于设置select的超时时间：
```cpp
struct timeval{
	long tv_sec; // 秒数
	long tv_usec;// 微秒数
};
```
从其定义我们可以看出：==它提供了微秒级的定时方式==，若是我们将其设置为0，即：监听时间为0，这会使得select立即返回。
至于为什么需要使用指针呢？这点应该很好理解，就是为了避免拷贝，需要将该参数提交给内核，==内核会将其修改，以告诉应用程序select等待了多久==。
但是在游双的《Linux高性能服务器编程》中写道：
> 不过，我们不能完全信任select调用返回后的timeout值，比如调用失败时timeout值是不确定的。

### 文件描述符的就绪条件
<font color="red"><b>此节摘抄与游双的《Linux高性能服务器编程》第九章，具体为9.1.2</b></font>。
在网络编程中，下列情况的socket可读：
- **socket内核接收缓存区**中的字节数==大于或等于==其**低水位标记SO_RCVLOWAT**。此时我们可以**无阻塞**地读取该socket，并且读操作返回地字节数大于0
- socket通信地对方关闭连接。此时对该socket读操作将返回0
- 监听socket上有新的连接请求
- socket上有==未处理的错误==。此时我们可以使用**getsockopt**来读取和清除该错误

下列情况下socket可写：
- **socket内核发送缓存区**中的可用字节数大于或等于其**低水位标记SO_SNDLOWAT**。此时我们可以无阻塞地写该socket，并且写操作返回的字节数大于0
- socket的写操作被关闭。对写操作被关闭的socket执行写操作将触发一个**SIGPIPE信号**
- wocket使用**非阻塞的connect**连接成功或者失败（超时）之后
- socket上有未处理的错误。此时我们可以使用getsockopt来读取和清除该错误

在网络程序中，==select能处理的异常情况只有一种：socket上接收到[[#带外数据与普通数据|带外数据]]==。

### 带外数据与普通数据
**普通数据**（Normal Data）是指==正常的、按照通常顺序传输的数据==，<font color="red"><b>是正常状态</b></font>。当进行网络通信时，普通数据是按照先进先出的原则进行传输的。发送方将数据逐个字节地发送给接收方，并确保接收方按照相同的顺序接收和重新组装数据。
**带外数据**（Out-of-Band Data）指的是==具有高优先级的数据==，被划分为与普通数据分开的数据通道，它也被称为”**紧急数据**“，<font color="red"><b>是一种异常状态</b></font>。==带外数据可以在数据流中插入，即使在普通数据还未发送完毕的情况下，带外数据也可以及时传输并被接收方处理==。带外数据的传输方式通常比普通数据的传输优先级更高。
==带外数据通常用于发送一些紧急的控制信息或异常情况的通知，例如中断信号或连接关闭请求等==。它们被用于提供紧急服务或在遇到特定事件时发送重要的控制信息。

### socket的状态
在常见的套接字模型中，**套接字的状态**可分为以下几种：
- 未连接（unconnected）：套接字没有与对方建立连接，处于初始状态或者已关闭状态
- 监听（listening）：服务器套接字正在等待客户端连接请求。这通常用于服务端创建一个监听套接字，以接收客户端的连接请求
- 连接已建立（connected）：套接字成功与远程对等体建立连接，并可以进行数据传输
- 关闭等待（closing）：套接字已发送关闭请求，正在等待对方的相应或确认关闭
- 已关闭（closed）：套接字连接已经关闭，并且不再可用（不可再次连接）

除了以上套接字状态，套接字在==某一时刻==拥有不同的**状态指示符**：
- 可读（readable）：套接字上有数据可供读取。可以使用select等异步IO多路复用时检查该状态
- 可写（writable）：套接字上可以写入数据。可以使用select等异步IO多路复用时检查该状态
- 异常（exceptional）：表示套接字遇到异常情况，例如：==带外数据到达或者发生错误等==。可以使用select等异步IO多路复用时检查该状态

这些状态指示符是==用于通知应用程序在某一时刻的特定状态==，以进行相应的处理。

### 一个简单的select服务器
```cpp
//
#include <sys/types.h>
// 网络通讯的核心函数都在这
#include <sys/socket.h>
//
#include <netinet/in.h>
#include <arpa/inet.h>
//
#include <assert.h>
#include <stdio.h>
#include <unistd.h>
#include <errno.h>
#include <string.h>
//
#include <fcntl.h>
//
#include <stdlib.h>

int main(int argc, char* argv[]){
    if(argc < 2){
        // basename这个函数在string.h中
        // 这个函数会去除文件名中的目录部分，只留下真正的文件名
        printf("usage:%s ip_address port_number\n", basename(argv[0]));
        return 1;
    }
    // 设置ip和port
    const char* ip = argv[1];
    // 这个atoi其实就是C++string中的stoi，其中的a是ASCII的缩写
    int port = atoi(argv[1]);

    // 使用ret来接收函数的返回值，以此来判断程序是否出错
    int ret = 0;
    sockaddr_in address;
    bzero(&address, sizeof(sockaddr_in));
    address.sin_family = AF_INET;

    /*
        因为我们输入的内容通常是点分十进制
        但是在网络传输的实际过程中，ip和port通常都需要在二进制的形式下进行处理

        此函数将ip转换为二进制后，将其设置为sockaddr_in.sin_addr

        这个函数在头文件arpa/inet.h中
    */
    inet_pton(AF_INET, ip, &address.sin_addr);
    address.sin_port = htons(port);

    // 创建监听套接字
    int listenfd = socket(PF_INET, SOCK_STREAM, 0);

    /*
        这是一个断言
        它判断条件是否满足
        若是满足，程序继续运行；若是不满足，程序终止运行，并输出错误信息
    */
    assert(listenfd >= 0);

    ret = bind(listenfd, (struct sockaddr*)&address, sizeof(address));
    assert(ret != -1);
    
    // 第二个参数是指：能够同时处理的最大连接数
    ret = listen(listenfd, 5);
    assert(ret != -1);

    struct sockaddr_in client_address;
    /*
        用于表示表示套接字地址结构长度的数据类型。
        是一个无符号整数类型，在套接字编程中用于指定套接字地址结构的长度。
        socklen_t类型的变量则用于指示地址结构的大小，常用于与函数accept()、bind()、connect()等配合使用。
    */
    socklen_t client_addrlength = sizeof(client_address);

    int connfd = accept(listenfd, (struct sockaddr*)&client_address, &client_addrlength);

    // 如果套接字创建失败
    if(connfd < 0){
        printf("errno is:%d", errno);
        close(listenfd);
    }


    char buf[1024];
    fd_set read_fds;
    fd_set exception_fds;
    FD_ZERO(&read_fds);
    FD_ZERO(&exception_fds);

    while(1){
        memset(buf, '\0', sizeof(buf));
        
        /*
            每次调用select前都要重新在read_fds和expection_fdfs中设置文件描述符connfd
            因为事件发生后，文件描述符集合将被内核修改

            将文件描述符：connfd的状态进行设置
            同时对其开启“读”和“异常”处理
        */
        FD_SET(connfd, &read_fds);
        FD_SET(connfd, &exception_fds);

        /*
            这里就有个问题了，第一个参数它是什么？
            是：指定被监听文件描述符的总数
            而文件描述符是从0开始的，因此需要+1
        */
        ret = select(connfd+1, &read_fds, NULL, &exception_fds, NULL);
        if(ret < 0){
            printf("selection failure");
            break;
        }

        /*
            对于可读事件，采用普通的recv函数读取数据
        */
       if(FD_ISSET(connfd, &read_fds)){
            ret = recv(connfd, buf, sizeof(buf)-1, 0);
            if(ret < 0){
                break;
            }
            printf("get%d bytes of normal data:%s\n", ret, buf);
       }

       /*
            对于异常事件，采用才MSG_OOB标志的recv函数读取带外数据
            （这个地方看得不是太懂）
       */
      else if(FD_ISSET(connfd, &exception_fds)){
            ret = recv(connfd, buf, sizeof(buf)-1, MSG_OOB);
            if(ret < 0){
                break;
            }
            printf("get#d bytes of oob data:%s\n", ret, buf);
      }
    }
    close(connfd);
    close(listenfd);
    
    return 0;
}
```

## poll模型
==poll模型和select模型类似，都是在指定时间内**轮询一定数量的文件描述符**，以测试其中是否有就绪者==，需要使用头文件<font color="red"><b>poll.h</b></font>：
```cpp
#include <poll.h>
int poll(struct pollfd* fds, nfds_t nfds, int timeout);
```
在select中使用的是fd_set结构体，而在此处的是<font color="red"><b>pollfd和nfds_t</b></font>，timeout的作用和select的一样，用于指定poll的超时值：==当timeout的值为-1时，poll调用将会永远阻塞，直到某个事件发生；当timeout为0时，poll调用将立即返回==。
poll的返回值也和select一致，表示就绪文件描述符的总数。

### pollfd结构体
```cpp
struct pollfd{
	int fd; // 文件描述符
	short int events; // 注册的事件
	short int revents; // 实际发生的事件，由内核填充
};
```
- fd指定文件描述符
- events成员告诉poll监听fd上的哪些事件，它是一系列事件的==按位或==
- revents成员==由内核修改==，以通知应用程序fd上实际发生了哪些事件

poll支持以下事件类型：

| 事件 | 描述 | 是否可作为输入 | 是否可作为输出 |
| :--: | :--: | :--: | :--: |
| POLLIN | 数据（包括普通数据和优先数据）可读 | 是 | 是 |
| POLLRNDORM | 普通数据可读 | 是 | 是 |
| POLLRDBAND | 优先级带数据可读 | 是 | 是 |
| POLLPRI | 高优先级数据可读，比如TCP带外数据 | 是 | 是 |
| POLLOUT | 数据（包括普通数据和优先数据）可写 | 是 | 是 |
| POLLWRNORM | 普通数据可写 | 是 | 是 |
| POLLWRBAND | 优先级带数据可写 | 是 | 是 |
| POLLRDHUP | TCP连接被对方关闭，或者对方关闭了写操作。它由GNU引入 | 是 | 是 |
| POLLERR | 错误 | 否 | 是 |
| POLLHUP | 挂起。比如管道的写端被关闭后，读端描述符上将收到POLLHUP事件 | 否 | 是 |
| POLLNVAL | 文件描述符没有打开 | 否 | 是 |

==在表中提到了很多事件，但是Linux中没有完全支持它们==。
通常，应用程序需要根据recv调用的返回值来区分socket上接受到的是有效数据还是对方关闭连接的请求，并做相应的处理。
> 不过，自Linux内核2.6.17开始，GNU为poll系统调用增加了一个==POLLRDHUP事件==，它在socket上接收到对方关闭连接的请求后触发。这为我们区分recv接受到的数据是有效数据还是对方关闭连接的请求提供了一种更简单的方式。
> <font color="red">但使用POLLRDHUP事件时，我们需要在代码最开始处定义_GNU_SOURCE</font>。

### nfds_t的定义
```c
typedef unsigned long int nfds_t;
```
该参数用来==指定被监听事件集合fds的大小==。

### 一个简单的poll服务器
```cpp
#include <iostream>
#include <vector>
#include <sys/socket.h>
#include <poll.h>
#include <algorithm>
#include <arpa/inet.h>
#include <assert.h>
#include <vector>
#include <unistd.h>

using namespace std;

int main(int argc, char* argv[]){
    if(argc != 3){
        cerr << "格式为 ip port" << endl;
        return 1;
    }

    int serverSocket, clientSocket;
    /*
        这个头文件在in.h中（实际上我们调用的是inet/in.h
        而inet/in.h被包含在头文件arpa/inet。h中了
    */
    struct sockaddr_in serverAddr{}, clientAddr{};
    socklen_t clientAddrLen;

    // 创建监听套接字
    serverSocket = socket(AF_INET, SOCK_STREAM, 0);
    assert(serverSocket != -1);

    serverAddr.sin_family = AF_INET;
    /*
        htons的英文意思是host to network shrot
        用于将16位无符号短整型（port）的主机字节序转换为网络字节序
    */
    serverAddr.sin_port = htons(stoi(argv[2])); 
    /*
        在调用 inet_pton 函数时，需要将 &(address.sin_addr) 作为参数传递，而不是 &(address.sin_addr.s_addr)
        struct sockaddr_in 结构体中的 sin_addr 字段是一个 struct in_addr 类型的结构体
        它包含了 IP 地址的二进制表示形式。in_addr 结构体中的 s_addr 字段实际上就是一个无符号整数类型（uint32_t）
        用来存储 IP 地址的二进制形式。
    */
    inet_pton(AF_INET, argv[1], &(serverAddr.sin_addr));

    // 绑定套接字到地址和端口
    int ret = bind(serverSocket, (struct sockaddr*)&serverAddr, sizeof(serverAddr));
    assert(ret != -1);

    ret = listen(serverSocket, 5);
    assert(ret != -1);

    // 监听的文件描述符队列
    /*
        创建一个pollfd类型的空向量
        并且将之前创建的serverSocket加入到其中进行监听
        POLLIN是我们所监视的事件类型，这点笔记中有写

        为什么需要监视serverSocket？
        答：这是为了实现服务器的异步IO，通过监视serverSocket及时检测到下面两种情况：
            1. 当有新的客户端连接请求到达时，我们希望能够立即进行处理。
                通过监视serverSocket上的POLLIN事件，可以检测到是否有客户端尝试建立连接
            2. 当serverSocket上出现其他错误情况（如连接断开或发生错误）时，我们也希望能及时进行处理
                通过监视serverSocket上的激长时间，如POLLHUP或POLLERR，可以检测到这些错误情况
    */
    vector<pollfd> fds;
    fds.push_back({serverSocket, POLLIN});

    while(true){
        int numRead = poll(fds.data(), fds.size(), -1);
        if(numRead < 0){
            cerr << "poll error";
            return 1;
        }

        // 
        for(auto &fd : fds){
            /*
                确保有新的连接
                但是不是很理解为什么是一直监听serverSocket
            */
            if(fd.fd == serverSocket && fd.revents & POLLIN){
                // 有新连接
                clientAddrLen = sizeof(clientAddr);
                clientSocket = accept(serverSocket, (struct sockaddr*)&clientAddr, &clientAddrLen);
                if(clientSocket < 0){
                    cerr << "Failed to accepted connection" << endl;
                    return 1;
                }
                else{
                    cout << "New connection from:" << inet_ntoa(clientAddr.sin_addr) << endl;
                    fds.push_back({clientSocket, POLLIN});
                }
            }else if(fd.revents & POLLIN){
                // 需要读取信息
                // 此时的不是监听socket，而是客户端的连接socket
                char buffer[1024];
                ssize_t bytesRead = recv(fd.fd, buffer, sizeof(buffer), 0);
                if(bytesRead <= 0){
                    if(bytesRead < 0){
                        cerr << "Error reading from client." << endl;
                    }
                    else{
                        cout << "Connection clost by client." << endl;
                    }
                    close(fd.fd);
                    // 这个remove_if()不是很熟
                    fds.erase(remove_if(fds.begin(), fds.end(),
                            [&](const pollfd& pfd){ return pfd.fd == fd.fd; }),
                            fds.end());
                }else{
                    // 处理数据
                    cout << "Received data: " << string(buffer, bytesRead) << endl;
                    // 将收到的数据回发给客户端
                    send(fd.fd, buffer, bytesRead, 0);
                }
            }
        }
    }

    // 关闭监听套接字
    close(serverSocket);
    return 0;
}
```

##  epoll模型
[[epoll模型]]
### epoll介绍
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

### epoll_create
在select/poll中，我们每次调用都需要传入**文件描述符集**或者**事件集**，但是在epoll中，我们使用了一个**事件表**将我们关注的那些事件存储起来，==这个事件表需要使用一个额外的文件描述符来标识==。
而epoll_create的作用就是==创建这个文件描述符==。
```cpp
#include <sys/epoll.h>

int epoll_create(int size);
int epoll_create1(0); // 参数是一个flag，一般设置为0即可，详细可以看man epoll
```
- size：目前来说没有任何作用，仅仅是提示内核这个事件表需要多大，==传入一个大于0的数即可==
- 返回值：就是这个epoll事件表的文件描述符

### epoll_ctl
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

#### epoll_event结构体（没搞懂）
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


### epoll_wait
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

### epoll的两种触发模式：LT和ET
epoll对文件描述符的操作又两种模式：<font color="pink"><b>LT（Level Trigger，电平触发）</font></b>模式和<font color="pink"><b>ET（Edge，边沿触发）</font></b>模式。
==LT是epoll的默认工作模式，这种模式下epoll相当于一个效率较高的poll==。当往epoll内核事件表中注册一个文件描述符上的EPOLLET事件时，epoll将以ET模式来操作该文件描述符。<font color="red"><b>ET模式是epoll的高效工作模式</b></font>。
## 使用epoll并发模型
### 源代码
server.cpp：
```cpp

```
client.cpp：
```cpp
```
util.cpp和util.h和之前的一致，就不写了。


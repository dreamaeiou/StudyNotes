## 动态库和静态库
==当动态库和静态库同时存在的时候，会优先使用动态库==。
### 静态库
### 1. 制作静态库
```powershell
g++ -c -o lib库名.a 源文件代码清单
```
-c表示只编译，-o则是说明需要指定文件名

####  2. 使用静态库
```powershell
g++ 选项 源代码文件名清单 -l库名 -L库文件所在的目录名
```

#### 3. 库文件的概念
程序在编译时，会将库文件的二进制代码链接到目标程序中，这种方式称为**静态编译**。
如果多个程序中用到了同一个静态库中的函数，就会存在多份拷贝。

#### 4. 静态库的特点
- 静态库的链接是在编译时期完成的，执行的时候代码加载速度快。
- 目标程序的可执行文件比较大，浪费空间
- 程序的更新和发布不方便，如果某一个静态库更新了，所有使用它的程序都需要重新编译

### 动态库
#### 1. 制作动态库
```powershell
g++ -fPIC -shared -o lib库名.so 源代码文件清单
```

#### 2. 使用动态库
```powershell
g++ 选项 源代码文件名清单 -l库名 -L库文件所在的目录名
```
需要注意的是：运行可执行程序的时候，需要提前设置<font color="red"><b>LD_LIBRARY_PATH</b></font>环境变量。

#### 3. 动态库的概念
程序在编译时不会把库的二进制代码链接到目标程序中，而是在运行的时候才被载入。
如果多个程序中用到了同一动态库中的函数，那么在内存中只有一份，避免了空间浪费问题。

#### 4. 动态库的特点
- 程序在运行的过程中，需要用到动态库的时候才把动态库的二进制代码载入内存
- 可以实现进程之间的代码共享，因此动态库也称为**共享库**
- 程序升级比较简单，不需要重新编译程序，只需要更新动态库就行

## makefile
makefile是一个**编译规则文件**，用于实现自动化编译
[[../杂项/Makefile|Makefile]]中有写

## main函数的参数
main函数有三个参数，分别是argc、argv和envp：
```cpp
int main(int argc, char* argv[], char* envp[]){ }
```
- argc：存放了程序参数的个数，包括程序本身
- argv：字符串数组，存放了每个参数的值，==包括程序名本身==
- envp：字符串数组，存放了环境变量，数组的最后一个元素是空

什么叫包括程序本身？
在Linux中，我们想要运行这个程序，就需要在终端中使用指令：
```powershell
./程序名
```
其实==这就相当于将程序名作为一个参数传递给main函数，因此不管什么时候，argc最小都为1==，但是我们在终端输入的时候可能还有别的情况：
```
./程序名 Hello World
```
此时这个main函数就接收了三个参数，即：argc = 3，此时的argv为：
```powershell
argv[0] = "./程序名"
argv[1] = "hello"
argv[2] = "world"
```

## 操作环境变量
### 1. 设置环境变量
使用函数**setenv**()：（<font color="red"><b>这个函数是POSIX提供的，因此只能够在Linux系统中使用</b></font>）
```cpp
int setenv(const char* name, const char* value, int overwrite);
```
- name：环境变量名
- value：环境变量的值
- overwrite：这个变量的值有两种情况：0和非0
	- 0：如果环境变量不存在，则增加新的环境变量；如果环境变量已经存在，不替换它的值
	- 非0：如果环境变量不存在，则增加新的环境变量；如果环境变量已经存在，替换它的值
- 返回值：0（成功），-1（失败）
#### 注意事项
<font color="red"><b>此函数设置的环境变量只对本进程有效，不会影响shell的环境变量</b></font>。
也就是说，如果执行了setenv()函数后关闭了该程序，上次的设置失效。

### 获取环境变量的值
```cpp
char* getenv(const char* name);
```
这个函数就更简单了，好像也没什么好说的。
==但是这个函数与setenv不同，getenv()是C/C++库提供的，在stdlib.h（cstdlib）中==。

## gdb常用命令
gdb（GNU symbolic debugge）是C/C++最常用的调试工具，gdb通常需要手动安装。
### 1. 安装gdb
```powershell
sudo apt install gdb
```

### 2. gdb常用命令
==如果希望程序可调试，编译的时候需要添加-g（gdb的缩写）选项，并且不能够使用-O选项进行优化==。
在开始调试之前，需要输入指令：
```powershell
gdb 目标程序
```

|命令|简写|命令说明|
|:-:|:-:|:-:|
|set args||设置程序运行的参数，例如：set args 需要输入的参数|
|break|b|设置断点（可以有多个），例如：b 20，表示在第20行设置断点|
|run|r|开始运行程序，或在程序运行结束后重新开始执行|
|next|n|执行当前行语句，如果该语句为函数调用，不会进入函数内部|
|step|s|执行当前行语句，如果该语句为函数调用，则会进入函数内部（有源码才能进）|
|print()|p|显示变量或者表达式的值，如果p后面是表达式，会执行这个表达式|
|continue|c|继续运行程序，遇到下一个断点停止，如果没有遇到断点，程序将会一直运行|
|set var||设置变量的值|
|quit|q|退出gdb模式|

## Linux的时间操作
UNIX操作系统根据计算机产生的年代把1970年1月1日作为UNIX的纪元时间，1970年1月1日是时间的中间点，将从1970年1月1日起经过的秒数用一个整数存放
### time_t
**time_t**用于表示事件类型，它是**long**类型的别名，在头文件**time.h**中定义，用于表示==1970年1月1日到0时0秒到现在的秒数==。

### time()
**time**函数用于==获取操作系统的当前时间==，需要使用头文件**time.h**
它有两种使用方法：
1. 将空地址传给time()，并将time的返回值赋值给now：
	```cpp
	#include <time.h>
	
	time_t now = time(0);
	```
2. 将变量的地址作为参数传递给time()：
	```cpp
	#include <time.h>
	time_t now;
	time(&now);
	```

### tm结构体，localtime()和mktime()
**time_t**是一个长整数，不符合人类的使用习惯，需要转换成**tm结构体**，tm结构体在头文件**time.h**中：
```cpp
struct tm{
	int tm_year; // 年份：其值等于实际年份减去1970
	int tm_mon;  // 月份：取值区间为[0, 11]
	int tm_mday; // 日期：一个月中的日期，取值区间为[1, 31]
	int tm_hour; // 时：取值区间为[0, 23]
	int tm_min;  // 分：取值区间为[0, 59]
	int tm_sec;  // 秒：取值区间为[0, 59]
	int tm_wday; // 星期：取值区间为[0, 6],0是星期天，6是星期六
	int tm_yday; // 从每年的1月1日开始算起的天数，取值区间为[0, 365]
	int tm_isdst;// 夏令时标识符（没啥用）
}
```

想要==将time_h转换为tm结构体==，需要使用库函数**localtime**，需要使用头文件**time.h**。
需要注意的是：==loacaltime()不是线程安全的（因为它使用一个静态的结构来存储转换后的本地时间，并返回指向该结构的指针），而localtime_r()是线程安全的（它接受一个指向存储结构的指针作为参数，并将转换后的本地时间存储在该结构中，而不需要使用静态的存储）==。
```cpp
struct tm *localtime(const time_t* timep);
struct tm *localtime_r(const time_t* timep, struct tm* result);
```

若是要==将tm结构体转换成time_t==，就需要使用库函数**mktime**，它也在**time.h**中：
```cpp
time_t mktime(struct tm* tm);
```
==该函数主要用于时间的计算==。

### gettiemofday()
该函数用于获取1970年1月1日到现在的秒和当前秒钟已逝去的微妙数，==可用于程序计时==，该函数在头文件**sys/time.h**钟。
```cpp
int gettimeofday(struct timeva* tv, struct timezone* tz);

struct timeval{
	time_t        tv_sec;  // seconds
	susenconds    tv_usec; // microseconds
};

struct timezone{           // 时区
	int tz_minuteswest;    // minutes west of Greenwich
	int tz_dsttime;        // type of DST correction
};
```

## 程序睡眠
如果需要将程序挂起一段时间，可以使用**sleep**()和**usleep**()两个库函数，需要使用头文件**unistd.h**：
```cpp
unsigned int sleep(unsigned int seconds); // 单位是秒
int usleep(useconds_t usec);              // 单位是微秒
```

## 目录操作函数
### 1. 获取当前目录函数getcwd()和get_current_dir_name()
**getcwd**()和**get_current_dir_name**()，这两个函数都在头文件**unistd.h**中：
```cpp
char* getcwd(char* buf, size_t size);
char* get_current_dir_name(void);
```
这两个函数功能上没什么区别：
```cpp
#include <iostream>
#include <unistd.h>
using namespace std;

int main(){
	char path1[256];    // linux系统目录的最大长度嘶255
	getcwd(path1, 256);
	cout << "path1 = " << path1 << endl;

	char* path2 = get_current_dir_name();
	cout << "path2 = " << path2 << endl;
	free(path2);        // 注意释放内存
}
```
注意事项：==get_currrent_dir_name()会动态分配内存，需要使用char\*进行接收，并且这块内存需要我们进行手动释放==，并且需要注意，get_current_dir_name()中使用的是**malloc**进行内存分配，因此我们在释放的时候也要使用**free**，==new、delete、malloc、free不能混用！混用可能会导致问题==。

### 2. 切换工作目录chdir()、创建目录mkdir()和删除目录rmdir()
#### 切换工作目录chdir()
切换工作目录函数**chdir**需要包含头文件**unistd.h**：
```cpp
#include <unistd.h>

int chdir(const char* path);
```
==若是返回值为0则表示切换成功，若非0则失败（目录不存在或没有权限）==。

#### 创建目录mkdir()
创建目录的函数名就是Linux中创建目录的命令名**mkdir**，它需要使用头文件**sys/stat.h**：
```cpp
#include <sys/stat.h>

int mkdir(const char* pathname, mode_t mode);
```
可以看到该函数有两个参数：
- pathname：目录名
- mode：访问权限的数字写法，如：0755（不能省略前置的0，因为==权限数字是八进制==）

返回值和chdir()一样。

#### 删除目录rmdir()
使用过**rmdir**()需要包含头文件**unistd.h**：
```cpp
int rmdir(const char* path);
```
path就是要删除的目录的路径，返回值和chdir()也是一样的。

## 获取目录中文件的列表
这一系列的操作都需要使用头文件**dirent.h**（dir event），一共有三个步骤：
#### 步骤一：用opendir()打开目录
```cpp
DIR* opendir(const char* pathname);
```
若是成功，返回目录的地址；若是失败，返回空地址。
#### 步骤二：用readdir()读取目录
```cpp
struct dirent* readdir(DIR* dirp);
```
若是成功过，返回**struct dirent结构体**的地址；若是失败，返回空地址。

#### 步骤三：用closedir()关闭目录
```cpp
int closedir(DIR* dirp);
```

### 相关的数据结构DIR
在上面的函数中，我们使用了目录指针DIR*，每调用一次readdir()，含税返回struct dirent的地址，==存放了本次读取到的内容==：
```cpp
struct dirent{
	long d_ino;                 // inode number索引节点号
	off_t d_off;                // offset to this dirent在目录文件中的偏移
	unsigned short d_reclen;    // length of this d_name文件长度名
	unsigned char d_type;       // the type of d_name文件类型
	char d_name[NAME_MAX + 1];  // file name文件名，最长255字符（因为是Linux系统）
};
```
重点在**d_name**和**d_type**：
- d_name是文件名或目录名
- d_type是文件类型，有多种取值，这里我们只关注两种：
	- 8：常规文件
	- 4：目录

## Linux的系统错误
在C++程序中，如果调用了库函数，可以通过函数的返回值判断调用是否成功。其实还有一个整型的**全局变量errno**，存放了函数调用过程中产生的错误代码。
如果调用库函数失败，可以通过errno的值来查找原因，这也是调试程序的一个重要方法。
使用errno需要包含头文件**errno.h**（或**cerrno**），配合**strerror**()和**perror**()两个库函数，可以差点出错的详细信息。
### strerror()
**strerror**()在头文件**string.h**中声明，用于获取错误代码对应的详细信息。它有两个版本，一个线程安全，一个非线程安全：
```cpp
char* strerror(int errnum);                             // 非线程安全
char* strerror_r(int errnum, char* buf, size_t buflen); // 线程安全
```
这里给出一段示例代码：
```cpp
#include <string.h>
#include <iostream>
using namespace std;

int main(){
	int ii;
	for(ii=0; ii<150; ii++){ // gcc 8.3.1 一共有133个错误代码
		cout << ii << "：" << strerror(ii) << endl;
	}
}
```
运行这段代码，能看到0~133都是有语句输出的，其中：==0表示程序正常运行，1~133是错误信息==。

### perror()
**perror**()在头文件**stdio.h**中声明，用于==在控制台显示最近一次系统错误的详细信息==，在实际开发中，服务程序在后台运行，通过控制台显示错误信息意义不大：
```cpp
void perror(const char* s);
```

### 注意事项
#### 1. 调用库函数失败不一定会设置errno
==并不是全部的库函数在调用失败时都会设置errno的值，以**man**手册为准==（不属于系统调用的函数不会设置errno，即：==操作系统（OS）提供的库才会设置errno==）

#### 2. errno不能作为调用函数失败的标志
==errno的值只有在库函数调用发生错误时才会被设置，当库函数调用成功时，errno的值不会被修改，不会主动得置为0。==
在实际开发中，判断函数执行是否成功还得靠函数的返回值，只有在返回值是失败的情况下，才需要关注errno的值。

## 目录和文件的更多操作
### access()
**access**()用于==判断当前用户对目录或文件的存取权限==，需要包含头文件**unistd.h**：
```cpp
int access(const char* pathname, int mode);
```
- pathname：目录或文件名
- mode：需要判断的存取权限，在**unistd.h**中存在如下宏定义：
	```cpp
	  #define R_OK 4 // 判断是否有读权限
	  #define W_OK 2 // 判断是否有写权限
	  #define X_OK 1 // 判断是否有执行权限
	  #define F_OK 0 // 判断是否存在
	```
- 返回值：若是pathname满足mode权限就返回0；不满足就返回-1，并设置errno（这也说明==unistd.h是Linux提供的库==）

### stat()与stat结构体
（略）

### rename()
rename()函数在头文件**stdio.h**中，用于==重命名目录或文件，相当于操作系统的mv命令==：
```cpp
int rename(const char* oldpath, const char* newpath);
```
- oldname：原目录或文件名
- newpath：目标目录或文件名
- 返回值：0（成功），-1（失败，并设置errno）

在实际开发中，access()主要用于判断目录或文件是否存在。

### remove()
remove()函数在头文件**stdio.h**中，用于==删除目录或文件，相当于操作系统的rm命令==：
```cpp
#include <stdio.h>

int remove(const char* pathname);
```
- pathname：待删除的目录或文件名
- 返回值：0（成功），-1（失败，并设置errno）

## Linux中的信号
### 信号的基本概念
信号（signal）是软件中断，是进程之间相互传递消息的一种方法，用于通知进程发生了事件，但是，不能给进程传递任何数据。
信号产生的原因有很多，在Shell中，可以用**kill**和**killall**命令发送信号：
```shell
kill -信号的类型 进程编号
killall -信号的类型 进程名
```

### 信号处理
进程对信号的处理方法有三种：
1. 对该信号的处理采用系统的默认操作，大部分的信号的默认操作是终止进程
2. 设置终端的处理函数，收到信号后，由该函数来处理
3. 忽略某个信号，对该信号不做处理，就像未发生过一样

主要是通过**signal**函数来==设置对信号的处理方式==，需要包含头文件**signal.h**：
```cpp
sighandler_t signal(int signum, sighander_t handler);
```
- signum：信号的编号，在Linux中默认有64种编号（0~63，==其中很大一部分属于自定义信号，默认是终止进程==）
- handle：信号的处理方式
	- SIG_DFL：恢复参数signum信号的处理方式为默认行为
	- ==一个自定义的处理很好的函数，函数的形参是信号的编号==
	- SIG_IGN：忽略参数signum所指的信号
这里给出一段示例：
```cpp
// 如果接收到信号1，就执行func函数中的内容
signal(1, func);
```
### 发送信号
可以使用**kill**库函数发送信号：
```cpp
int kill(pid_t pid, int sig);
```
- pid：指定的进程
- sig：所指定的需要发送的信号

<font color="red">其他内容后续再来补充</font>

## 进程终止
一共有八种方式可以终止进程，其中5种为正常终止：
1. **main**()中使用**return**返回
2. 在任意函数中调用**exit**()
3. 在任意函数中调用\_exit()或\_Exit()
4. . 最后一个线程中其启动例程（线程主函数）用return返回
5. 在最后一个线程中调用**pthread_exit**()返回

还有3种异常终止：
1. 调用**abort**()终止
2. 接收到一个信号
3. 最后一个线程对取消请求做出响应

### 进程终止的状态
在**main**()中，==return的返回值即终止状态，如果没有return语句或调用exit()，那么该进程的终止状态是0==。
在Shell中，查看进程的终止状态：
```shell
echo &?
```
正常终止进程的三个函数：
- exit()
- \_Exit()
- \_exit()

其中，前两个是ISO C说明的，\_exit()是POSIX说明的：
```cpp
void exit(int status);
void _exit(int status);
void _Exit(int status);
```
status即为进程终止的状态。
==如果进程不是正常终止，打印的终止状态为非0==。

## 调用可执行程序
Linuz提供了**system**()和**exec**()**函数族**，在C++程序中，可以执行其他的程序（二进制文件，操作系统命令或Shell脚本）
### system()
system()提供了一种简单的执行程序的方法，需要使用头文件**stdlib.h**，把需要执行的程序和参数用一个字符串传给system()就行了。
```cpp
int system(const char* string);
```
system()的返回值比较麻烦：
- 如果函数执行失败，system()返回值非0
- 如果程序执行成功，并且被执行的程序终止状态是0，此函数的返回值即为0

#### 注意事项
==在使用此函数的时候，传递的参数最好使用全路径，这样可以避免环境变量的问题==。

### exec函数族
**exec函数族**提供了另一种在进程中调用程序（可执行文件或Shell脚本）的办法：
```cpp
int execl(const char* path, const char* arg, ...);
int execlp(const char* file, const char* arg, ...);
int execle(const char* path, const char* arg, ..., char* const envp[]);
int execcv(const char* path, char* const argv[]);
int execvp(const char* file, char* const argv[]);
int execvpr(const char* file, char* const argv[], char* const envp[]);
```

## Linux网络通信
[[Linux服务器开发学习]]
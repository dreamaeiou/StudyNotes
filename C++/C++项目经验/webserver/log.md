## 超时锁的编写
这个问题处于```blockqueue.h```文件中，内容如下：
```cpp
template<class T>
bool BlockDeque<T>::pop(T& item, int timeout) {
    std::unique_lock<std::mutex> locker(mtx_);
    while(deq_.empty()) {
        if(condConsumer_.wait_for(locker, std::chrono::seconds(timeout))
        == std::cv_status::timeout) {
            return false;
        }
        if(isClose_) {
            return false;
        }
    }
    item = deq_.front();
    deq_.pop_front();
    condProducer_.notify_one();
    return true;
}
```
在if的判断中，学习到了关于超时判定部分：
```cpp
if(condConsumer_.wait_for(locker, std::chrono::seconds(timeout))
  == std::cv_status::timeout) {
	...
}
```
**wait_for**已经知道是循环等待了，这在之前关于C++多线程的笔记中有写，这里面有疑惑的主要是这个```std::cv_status```是什么东西。[C++参考手册](https://en.cppreference.com/w/cpp/thread/cv_status)中有相应的内容：
```cpp
enum class cv_status {
    no_timeout,
    timeout  
};
```
可以看到，它其实就是一个很简单的枚举类，用于判断是否超时。
查看有关wait_for相关的内容也可发现以下内容：
![[img/wait_for.png]]


## 类的static关键字
我对这点有点忘记了，先描述一下static成员所具有的特点吧：
1. 静态成员函数只能访问静态成员变量
2. 静态成员变量不能够使用this指针，因为==静态成员变量属于类而不属于类的实例==
3. 静态成员变量需要在类内声明，但是在类外初始化（<font color="red">但静态成员常量可以在类内进行初始化</font>）![[img/静态常量可在类内初始化.png]]，如：
	```cpp
	class Temp {
	private:
		static int num;
	};

	int Temp::num = 10;
	```
	有几点我现在还是有点不是很理解：
	- 为什么在类外初始化的时候还是需要加上该变量的类型？就是说在我的想法中，由于在类内中我已经声明了这个变量Temp::num是int类型的，所以我在初始化的时候不应该再进行一个小的声明：
		```cpp
		Temp::num = 10;
		```
	- 为什么一定要在类外初始化？（<font color="red"><b>静态成员变量不能在类内初始化</b></font>）
4. 静态成员在某种意义上和全局变量很相似，它的生命周期是整个程序的运行周期。

### 局部静态变量
局部静态变量同时具有**局部变量**和**静态变量**的性质：
1. 具有局部性：该变量只有在函数内部可使用
2. 具有全局性：该变量的生命周期是程序的运行周期
3. 静态：只会被初始化一次

```cpp
void func() {
	static int num = 0;
	return num++;
}

int main() {
	cout << func() << endl;
	cout << func() << endl;
	cout << func() << endl;
}
```
通过运行这段简单的程序就能够理解了。

## FILE类
这个项目中使用的是FILE，这个是C/C++官方提供的一个抽象接口，是比**文件描述符fd**更高一级的接口：
```cpp
struct _IO_FILE;
typedef struct _IO_FILE FILE;
```
从源文件中只能找到这一步，再往上走关于``_TO_FILE``的定义我就没找到了。

[C++参考手册](https://en.cppreference.com/w/c/io/FILE)，其中对FILE这个结构体进行了部分描述，由于该结构体是一个不透明的文件流，所以在参考手册中对其也没有很明确的描述，只需要怎么使用它就行了。
相关的常用函数如下：
```cpp
FILE *fopen(const char *filename, const char *mode);
int fclose(FILE *stream);
size_t fread(void *ptr, size_t size, size_t count, FILE *stream);
size_t fwrite(const void *ptr, size_t size, size_t count, FILE *stream);
int fgetc(FILE *stream);
int fputc(int c, FILE *stream);
long ftell(FILE *stream);
int fseek(FILE *stream, long offset, int whence);
void rewind(FILE *stream);
int feof(FILE *stream);
int ferror(FILE *stream);
void clearerr(FILE *stream);
```
接下来给一段实例代码，用于展示FILE对文件的操作：
```c
#include <stdio.h>

int main() {
    // 打开文件以进行写入
    FILE *file = fopen("example.txt", "w");
    if (file == NULL) {
        perror("Error opening file");
        return 1;
    }

    // 写入数据
    fprintf(file, "Hello, world!\n");
    fclose(file); // 关闭文件

    // 打开文件以进行读取
    file = fopen("example.txt", "r");
    if (file == NULL) {
        perror("Error opening file");
        return 1;
    }

    // 读取并打印数据
    char buffer[256];
    while (fgets(buffer, sizeof(buffer), file) != NULL) {
        printf("%s", buffer);
    }
    fclose(file); // 关闭文件

    return 0;
}
```
<font color="red">我觉得FILE有点难用（毕竟刚开始）</font>。

## time_t
==```time_t```通常用来存储自1970年1月1日00:00:00 UTC以来经过的秒数，通常需要转换为```tm```以便更好地进行表示==。
在以下代码中：
```cpp
#include <ctime>

time_t timer = time(nullptr); // 用于获取当前时间
struct tm* sysTime = localtime(&timer); // 将time_t转换为tm格式
struct tm t = *sysTime;
```
**time_t**在探查之后发现它是一个```long int```类型，而```tm```才是我们坑看懂的类型。
```cpp
time_t time(time_t *t); // 获取当前时间的time_t值
struct tm *localtime(const time_t *timep); // 将time_t转换为tm，表示为本地时间
struct tm *gmtime(const time_t *timep); // 将time_t转换为tm，表示为UTC时间
```

### tm
time_t只是一个数字，用于表示秒数，这个数字我们人来看是不能直接读懂的，因此需要转换为人能读懂的格式，即：```tm```：
```cpp
struct tm
{
  int tm_sec;			/* Seconds.	[0-60] (1 leap second) */
  int tm_min;			/* Minutes.	[0-59] */
  int tm_hour;			/* Hours.	[0-23] */
  int tm_mday;			/* Day.		[1-31] */
  int tm_mon;			/* Month.	[0-11] */
  int tm_year;			/* Year	- 1900.  */
  int tm_wday;			/* Day of week.	[0-6] */
  int tm_yday;			/* Days in year.[0-365]	*/
  int tm_isdst;			/* DST.		[-1/0/1]*/

# ifdef	__USE_MISC
  long int tm_gmtoff;		/* Seconds east of UTC.  */
  const char *tm_zone;		/* Timezone abbreviation.  */
# else
  long int __tm_gmtoff;		/* Seconds east of UTC.  */
  const char *__tm_zone;	/* Timezone abbreviation.  */
# endif
};
```
而转换主要使用两个函数：
```cpp
struct tm *localtime(const time_t *timep); // 将time_t转换为tm，表示为本地时间
struct tm *gmtime(const time_t *timep); // 将time_t转换为tm，表示为UTC时间
```
## 格式化字符串的使用
在使用snprintf的时候使用了以下格式化字符串：
```cpp
"%s/%04d_%02d_%02d%s"
```
对这个我不是很懂，所以就查了下：
- %s：这个很常用，字符串占位符，不多说了
- %04d：%d都知道是表示的整数，%04d则是对这个整数还进行了一个约束：这个整数是四位数，若不是四位数在高位补0
- %02d：类似与%04d

这里我们可以用一段简短的代码试一试：
```cpp
#include <cstdio>

int main() {
    printf("%04d\n%4d", 1, 1);
}
```
这段代码中，两种占位符稍有不同：一种是04另一种就是4，==后者的输出会保持四位，但是不会补0，而前者会补0==：
```txt
0001
   1
```

## timeval
在上面使用了[[#time_t]]，这里却又使用的是```tiemval```，这两个都是和时间相关的结构体，但是它们之间还是有区别的：
> time_t是C标准库提供的
> timeval是POSIX标准提出的
> 
> timeval的精度要高于time_t，前者可以达到微秒级，后者则是秒

```cpp
#include <sys/time.h>

int settimeofday(const struct timeval *tv, const struct timezone *tz);
```
- tv：用于接收时间的变量
- tz：用于设置时区的变量（现已抛弃，直接传入nullptr就好）

```cpp
struct timeval {
    time_t      tv_sec;  // 从1970年1月1日00:00:00 UTC到当前时间的秒数
    suseconds_t tv_usec; // 当前时间的微秒数
};
```

## C语言的可变参数
这个是C语言的一种写法，C++的写法不太一样，有点类似于递归。
```va_list```的具体用法如下：

```cpp
#include <stdio.h>
#include <stdarg.h>

// 自定义的函数，接受一个整数和可变数量的整数参数
void printNumbers(int count, ...) {
    va_list args;
    va_start(args, count);  // 初始化 va_list

    for (int i = 0; i < count; i++) {
        int num = va_arg(args, int);  // 访问下一个参数
        printf("%d ", num);
    }

    va_end(args);  // 清理 va_list
    printf("\n");
}

int main() {
    printNumbers(3, 1, 2, 3);        // 输出: 1 2 3
    printNumbers(5, 10, 20, 30, 40, 50);  // 输出: 10 20 30 40 50

    return 0;
}
```
其中的```count```表示的是该函数的最后一个固定参数。

上述代码是它的最基础使用，接下来详细说说```stdarg.h```的内容：
- 声明一个```va_list```类型的变量，用于存储可变参数
- ``va_start``用于初始化上面声明的```va_list```
	```cpp
	void va_start(va_list ap, last);
	```
	1. ap：va_start 将在这个变量中初始化可变参数的访问。
	2. last：这是**最后一个固定参数的名称**，va_start 用这个参数来确定可变参数列表的开始位置。
- ```va_arg```：用于访问可变参数
- ```va_end```：结束对```va_list```的访问（==若是没有结束会引起资源泄漏问题==）

接下来再给一段更好理解的小程序：
```cpp
#include <stdio.h>
#include <stdarg.h>

void temp(int last, ...) {
    va_list valist;
    va_start(valist, last);

    char msg[256] = {};
    
    vsnprintf(msg, 256, "%s, %s", valist);
    printf("%s", msg);

	va_end(valist);
}

int main() {
    temp(1, "hello", "world");
}
```
上i满这段代码使用了一个新的函数：```vsnprintf```；```snprintf```之前已经知道，就是==用于格式化字符串==，该函数同样是格式化字符串，只不过它传入的参数有```va_list```类型的，也就是说，它能够很好地处理可变参数的情况。
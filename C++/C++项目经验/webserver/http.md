## IMPORTANT
<font color="red"><b>对于这个http这个文件夹还是有很多问题，还需要反复去理解</b></font>：
1. 对于Http的格式不理解
2. 对于整个网络传输流程不理解
3. 对类Unix系统的文件操作也不是很理解
	- sys/stat.h
4. 请求报文和接受和相应报文的生成流程

## 正则库regex
正则表达式是一种用于匹配、搜索和处理字符串的强大工具。它提供了一种灵活且高效的方式来定义和识别字符串模式，C++11开始提供此库：[regex](https://zh.cppreference.com/w/cpp/header/regex)

### regex
``regex``是一个**模板特化类**，实际上是``basic_regex<char>``的特化（其实还有wregex是``basic_regex<wchar_t>``的特化），==用于表达正则表达式，它支持多种正则表达式语法==（这点通过在创建```std::regex```的时候设置，具体查看上面链接中的C++参考手册）：
```cpp
std::regex(const std::string& str, std::regex_constants::syntax_option_type flag = std::regex_constants::ECMAScript);
```
这个构造函数中的第二个参数就是用于设置正则引擎的，以此来适用各种正则语法。

在我的项目源代码中，有如下代码：
```cpp
regex patten("^([^ ]*) ([^ ]*) HTTP/([^ ]*)$");
```
这里是使用的默认引擎：**ECMAScript**，这里来学习下这种正则语法。

#### ECMAScript正则语法
1. 特殊字符：
	- ``.``：匹配任何单个字符
	- ``*``：匹配前一个字符0次或n次
	- ``+``：匹配前一个字符1次或n次
	- ``?``：匹配前一个字符0次或1次
	- ``[]``：定义字符类，如：``[abc]``的意思是该位置可以是a或b或c
	- ``()``：用于分组和捕获
2. 量词：
	- ``{n}``：表示前一个字符出现的次数为n次
	- ``{n,}``：表示前一个字符出现==至少==n次
	- ``{n,m}``：表示前一个字符出现至少n次，最多m次
3. 边界匹配：
	- ``^``：字符串的开始
	- ``$``：字符串的结束

### match_results和sub_match
这两个东西我也没有吃得很透，好像属于C++比较难的部分了，但是大概的原理我觉得我还是能说清楚的。

在regex中，我们对我们希望的正则模式进行了定义，然后我们使用提供的对应的函数对其进行匹配（相关的函数后面会说），对于正则的匹配结果：
- 每一个**子表达式**的匹配结果为一个``sub_match``
- 所有子表达式的结果都会存储到``match_result``中

这两个类实际上是**模板类**，也就是说，我们使用的时候如下：
```cpp
#include <regex>

std::match_results<std::string::const_iterator> matchres;
std::sub_match<std::string::const_iterator> submatch;
```
<font color="red"><b>只是我不是很理解为什么是迭代器而不是单独的string</b></font>。

由于这么写太复杂了，因此C++给部分常用的数据类型进行了**模板特化**，如：string变为``smatch``、wchar_t变为``wmatch``。

``match_results``重载了``[]``运算符，使其能像使用数组那般使用它，这里给一个例子：
```cpp
#include <string>
#include <iostream>
#include <regex>

using namespace std;

int main() {
    const string str = "Hello World";
    regex patten("^([^ ]*) ([^ ]*)$");
    smatch submatch;
    if(regex_match(str, submatch, patten)) {
        // cout << submatch[1] << endl;
        // cout << submatch[2] << endl;
        cout << submatch[0] << endl;
    }
    else {
        cout << "can't match" << endl;
    }
}
```
- ``submatch[0]``：原字符串
- ``submatch[n]``：根据正则匹配的每个子表达式的值

### regex_match和regex_search
之前说到：==进行匹配的时候是需要使用固定的函数对match_results进行设置==，这个函数有两个：
1. regex_match：用于==部分匹配==，查找字符串中是否有符合正则表达式的部分
	```cpp
	template <class BidirIt>
	bool regex_match(BidirIt first, BidirIt last, 
	                 std::match_results<BidirIt>& m, 
	                 const std::regex& rgx);
	```
2. regex_search：用于==完全匹配==，判断整个字符串是否符合正则表达式
	```cpp
	template <class BidirIt>
	bool regex_search(BidirIt first, BidirIt last, 
	                  std::match_results<BidirIt>& m, 
	                  const std::regex& rgx);
	```

参数说明：
- first 和 last：定义了要搜索的字符范围，通常是字符串的迭代器。
- m：用于存储匹配结果的 std::match_results 对象。
- rgx：要匹配的正则表达式。

### search的使用
原文中是这么写的：
```cpp
const char* lineEnd = search(buff.Peek(), buff.BeginWriteConst(), CRLF, CRLF + 2);
```
这个``search()``是``regex``中的内容，具体如下：
```cpp
search(_ForwardIterator1 __first1, _ForwardIterator1 __last1, _ForwardIterator2 __first2, _ForwardIterator2 __last2)
```
具体就是==在正则字符串中寻找模式串==：
- first1和last1：标记了正则字符串
- first2和last2：标记了模式字符串
- 返回值：nullptr表示没找到；否则就是匹配的位置的指针

```cpp
#include <string>
#include <iostream>
#include <regex>

using namespace std;

int main() {
    const char CRLF[] = "\r\n";
    string res = "Hello\r\nWorld";
    cout << res << endl;
    auto result = search(res.data(), res.data()+res.size(), CRLF, CRLF+2);
    cout << result - res.data() << endl;
    cout << &*res.begin() - res.data() << endl;
    // cout << result << endl;
}
```

## 加速对文件的访问
在本项目中使用了系统调用```mmap```，==将需要频繁进行访问的文件映射到内存中==，以此来提升IO速率。但是这步中还有很多疑惑，源代码如下：
```cpp
void HttpResponse::AddContent_(Buffer& buff) {
    int srcFd = open((srcDir_ + path_).data(), O_RDONLY);
    if(srcFd < 0) { 
        ErrorContent(buff, "File NotFound!");
        return; 
    }

    /* 将文件映射到内存提高文件的访问速度 
        MAP_PRIVATE 建立一个写入时拷贝的私有映射*/
    LOG_DEBUG("file path %s", (srcDir_ + path_).data());
    int* mmRet = (int*)mmap(0, mmFileStat_.st_size, PROT_READ, MAP_PRIVATE, srcFd, 0);
    if(*mmRet == -1) {
        ErrorContent(buff, "File NotFound!");
        return; 
    }
    mmFile_ = (char*)mmRet;
    close(srcFd);
    buff.Append("Content-length: " + to_string(mmFileStat_.st_size) + "\r\n\r\n");
}

void HttpResponse::UnmapFile() {
    if(mmFile_) {
        munmap(mmFile_, mmFileStat_.st_size);
        mmFile_ = nullptr;
    }
}
```

### mmap和munmap
``mmap``用于创建文件映射，而``munmap``则是删除创建的映射：
```cpp
void* mmap(void* addr, size_t length, int prot, int flags, int fd, off_t offset);
int munmap(void *addr, size_t length);
```
对于每个参数的作用我这里还是不说了，我觉得我说不明白，还是使用的时候查看man文档吧：
```shell
man 2 mmap
man 2 munmap
```

### 具有的疑惑
1. 明明在一开始获取``mmap``返回值的时候将其转换为``int*``类型，但是在设计``HttpResponse``这个类的时候，却是将存储映射文件的变量设置为``char*``类型，因此出现了后面再将``int*``转换为``char*``的部分。为什么要这么做？真的有必要吗？
2. 在这个项目中虽然使用了mmap进行内存映射，但是这么做真的有必要吗？对IO访问真的有提升吗？因为好像每一个连接都会重新创建一个HttpConn，并且对需要的文件进行一个映射，然后在该请求断开之后，就会将映射所占用的内存进行一个释放。若是很多连接都请求一个文件，然后都会创建映射，这样就有很多重复的映射，也就浪费了很多的内存资源。（是不是说创建这个映射只是为了这条连接？）

## 网络编程部分
这部分我都快忘干净了，看来要找时间去重新回顾一下了，这里就主要记录一下``netinet/in.h``部分。

### sockaddr_in(6)和sockaddr
这两个类都定义在该头文件中，是数据类Unix系统的网络库。
``sockaddr_in``是用于表示**IPv4**地址信息的结构体，而``sockaddr_in6``则是用于表示**IPv6**地址信息的结构体，==这两个结构体本质上都是对``sockaddr``的拓展==：
```cpp
struct sockaddr_in {
    sa_family_t sin_family; // 地址族，通常为 AF_INET
    in_port_t sin_port;     // 端口号（网络字节顺序）
    struct in_addr sin_addr; // IPv4 地址
    char sin_zero[8];       // 填充，以保持结构体大小与 sockaddr 一致
};

struct sockaddr {
    unsigned short sa_family; // 地址族
    char sa_data[14];         // 地址数据
};
```

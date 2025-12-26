## 取消同步流
[[../C++/重学C++11#输入输出|重学C++11]]

## getline()和getchar()的使用
在[[../C++/重学C++11#(6) std getline|重学C++11]]中有说。
它们在头文件**string**和**std**命名空间中，getline()用于读取一行作为输入，getchar()只读取一个字符作为输入。
我们来看看它们的声明：
```cpp
std::istream& getline(std::istream&, std::string&, char);
std::istream& getline(std::istream& is, std::string& str, char delim);
```

## 若是需要存储的数字很大怎么办？(字典序)
有时候我们需要储存很大的数据，以至于这个数据我们使用**long long**都没法放下，还是会溢出，这怎么办呢？此时我们就能够使用**string**去存储这个字符串，只是在比较大小的时候我们需要注意一下了，因为字符串的大小比较不同于一般的数字比较，假如==现在有两个string类型的变量要进行大小比较==：
- 如果a.size() < b.size()，==那么b一定是大于a的==
- 如果s.size() == b.size()，就对字典序进行比较，也就是各个字符在ASCII中的位置

这里给出一段示例代码：
```cpp
[](const People& one, const People& two){
        if(one.vote.size() < two.vote.size()){
            return true;
        }
        else if(one.vote.size() > two.vote.size()){
            return false;
        }
        // 说明两个字符串的位数相等，就按照字典序来对大小进行比较
        else{
            return one.vote < two.vote;
        }
    });
```
上面这段lambda表达式就是对两个string进行处理，当然，这种情况下是因为我们想要存储的还是一个数字类型的数据。
> [!字典序]
> 字典序（Lexicographical order）是一种对字符串进行比较的方法，它基于字符串中字符的 Unicode 值(或者ASCII值)进行比较。在字典序中，字符串从左到右逐个字符进行比较，直到找到两个不相等的字符或一个字符串已经比较完为止。
> 
   比较规则如下：
> - 如果两个字符串的第一个字符不相等，那么较小的字符（按照 Unicode 值）的字符串被认为是较小的。
 >- 如果两个字符串的前缀部分（即从开始位置到第一个不相等的字符之前的部分）完全相等，但一个字符串已经比较完了（即没有更多的字符可供比较），则较短的字符串被认为是较小的。
 >
> 如果两个字符串完全相等，则它们在字典序中被认为是相等的。
  例如，考虑以下两个字符串比较：
  “apple” 和 “banana”
  逐个字符比较：
  第一个字符：‘a’ 和 ‘b’，‘a’ 在 Unicode 表中的值小于 ‘b’，所以 “apple” 小于 “banana”。
  由于第一个字符已经确定，我们不再考虑后面的字符。
  因此，“apple” 在字典序中小于 “banana”。
>
>再举一个例子：
  “apple” 和 “app”
  逐个字符比较：
  “apple” 的前缀部分与 “app” 完全相同。
  “apple” 还有额外的字符 ‘l’ 和 ‘e’，但 “app” 已经没有更多字符可供比较。
  由于 “app” 是 “apple” 的前缀，并且 “apple” 还有额外的字符，所以 “app” 小于 “apple”。

## cmath
**cmath**头文件中的函数都是用于数学计算的，很多时候能给我们带来便利。同时需要使用命名空间**std**。
### (1) pow()和sqrt()
==pow()用于求某个数的指定次**幂**==，这里给出它的声明：
```cpp
double pow(double base, double exponent);
float pow(float base, float exponent);
long double pow(long double base, long double exponent);
```
base是**底数**，exp是**幂**。它有多个重载函数，利用**隐式转换**，我们也能够传入int类型作为base。==由于它计算浮点型可能会出精度问题，因此我们通常只传入int作为base==，这里给出一段非常简单的示例代码，用于计算一个整数的平方：
```cpp
#include<cmath>
#include<iostream>

int main() {
	int base;
	std::cin >> base;
	std::cout << "base的平方是：" << pow(base, 2);
}
```
==sqrt()用于计算某个数的**平方根**==，跟pow()一样，它也有多个重载版本：
```cpp
double sqrt(double x);
float sqrt(float x);
long double sqrt(long double x);
```
但是也是因为精度问题，我们往往也是传入int类型作为参数。同样给出示例代码，计算某个整型的平方根：
```cpp
#include<cmath>
#include<iostream>

int main() {
	int base;
	std::cin >> base;
	std::cout << "base的平方根是：" << sqrt(base);
}
```

### (2) abs()
这个函数用于==计算一个数字的绝对值==。
```cpp
int abs(int n);
long int abs(long int n);
long long int abs(long long int n);
float abs(float n);
double abs(double n);
long double abs(long double n);
```
使用很简单，也没有什么需要多说的点。

### (3) exp()和log()
exp()用于计算：==e的给定次幂==，即：
$$
	exp(num) = e^{num}
$$
log()则是计算：==以e为底的对数==，即：
$$
	log(num) = ln(num)
$$
除此之外，还有log2()和log10()，相对于的计算不同底数的对数：
$$
	log2(num) = log_2(num)
	log10(num) = log_{10}(num)
$$

### (4) round()
在C++中，如果将一个小数直接转化为整数，它会直接向下取整，但是很多时候我们不想这么做，而是想使用**四舍五入**，round函数就是实现的这个功能。
```cpp
#include <cmath>
#include <iostream>

int main(){
	double num;
	std::cin >> num;
	std::cout << "int(num) = " << int(num) << std::endl;
	std::cout << "round(num) = " << round(num) << std::endl;
}
```

## algorithm
C++中，标准库提供了很多内置函数，它们能够实现我们想要的功能、节省时间并且它们的效率都不太低。
### (1) std::max_element()和std::min_element()
假如我想要在容器中找到数值最大/最小的那个数，我们可以使用**标准库**中的max_element/min_element函数。我们先看看这两个函数的声明：
```cpp
template<class ForwardIt, class Compare>
ForwardIt max_element(ForwardIt first, ForwardIt last, Compare comp);

template<class ForwardIt, class Compare>
ForwardIt min_element(ForwardIt first, ForwardIt last, Compare comp);
```
max_element和min_element的函数声明可以说除了名字都一模一样：第一、二个参数都是迭代器，第三个参数是个谓词。但是它们的作用却截然相反，这正是因为它的第三个参数：**谓词[^谓词]**。==如果我们没有传入第三个参数，max_element/min_element将使用内置的operator<进行比较==。
我们看看**max_element的谓词声明**：
```cpp
 bool comp(const Type1 &a, const Type2 &b);
```
不管是max_element还是min_element，它的谓词要求都一样：
>==比较函数对象（即满足比较 (Compare) 要求的对象），如果a<b，那么返回 ​true==。


下面就给出我比赛中的一个例子：
```cpp
//opt是一个map
map<char, int>::iterator it = std::max_element(opt.begin(), opt.end(),
	[](const std::pair<char, int>& p1, const std::pair<char, int>& p2) {
     return p1.second < p2.second;
});
```
可以看到，这个lambda表达式返回的是一个bool值，如果它返回一个true，就说明第一个参数小于第二个参数，程序也就知道了二者的大小关系，通过不断的迭代比较就能够得到这个范围内的最大值；如果说，有多个相等的元素，它将会指向第一次达到最大值的元素。
man_element/min_element的返回值都是==指向那个最大/最小元素的迭代器==。

### (2) std::binary_search()
这个函数用于==在一个范围内搜索元素是否存在==。这里给出声明：
```cpp
template< class ForwardIt, class T >
bool binary_search( ForwardIt first, ForwardIt last, const T& value );

template< class ForwardIt, class T, class Compare >
bool binary_search( ForwardIt first, ForwardIt last, const T& value, Compare comp );
```
可以看出它==需要传入两个**迭代器**来规定搜索范围==，第三个参数则是需要搜索的元素。

### (3) remove()和remove_if()
这两个函数在容器处理中非常有用，它们可以==更改符合要求的元素的位置**至容器末尾**，并返回更改后的新结尾的尾后迭代器==，先给出它们的声明：
```cpp
template< class ForwardIt, class T >
ForwardIt remove( ForwardIt first, ForwardIt last, const T& value );

template< class ForwardIt, class UnaryPredicate >
ForwardIt remove_if( ForwardIt first, ForwardIt last, UnaryPredicate p );
```
需要注意的是：==这两个函数并不会更改容器的大小，仅仅是更改元素的位置==，并且：<font color="red"><b>被移动至尾后的元素可以被访问，但是它的值是未定义的！！！</b></font>，这里我们通过一小段demo来验证下：
```cpp
#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
using namespace std;
int main(){
    vector<int> res{1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    // res.erase(remove_if(res.begin(), res.end(),
    // [&](const int& temp){ return temp == 1; }),
    // res.end());

    auto after_remove = remove_if(res.begin(), res.end(),
         [&](const int& temp){ return temp == 1; });
    if(after_remove != res.end()){
        cout << *after_remove << endl;
    }

    for(auto& temp : res){
        cout << temp << " ";
    }

    cout << "the size of res is:" << res.size() << endl;
}
```
这段代码我们只使用remove_if对vector进行处理，我们看看运行结果会是什么样子：
```shell
7
2 3 4 5 6 7 8 9 7 8 9 the size of res is:11
```
我们不难发现：==vector的大小没有改变，同时，元素出现了重复，即出现了错误==。这个尾后迭代器的位置应该是第二个7，即：倒数第三个元素。
<font color="red"><b>remove_if和remove返回一个迭代器，告诉你从哪里开始的元素需要被擦除</b></font>。
因此，我们对这段代码进行一个修改：
```cpp
#include <iostream>
#include <string>
#include <algorithm>
#include <vector>
using namespace std;
int main(){
    vector<int> res{1, 1, 1, 2, 3, 4, 5, 6, 7, 8, 9};
    res.erase(remove_if(res.begin(), res.end(),
    [&](const int& temp){ return temp == 1; }),
    res.end());

    // auto after_remove = remove_if(res.begin(), res.end(),
    //      [&](const int& temp){ return temp == 1; });
    // if(after_remove
     != res.end()){
    //     cout << *after_remove << endl;
    // }

    for(auto& temp : res){
        cout << temp << " ";
    }

    cout << "the size of res is:" << res.size() << endl;
}
```
再运行下这段程序：
```shell
2 3 4 5 6 7 8 9 the size of res is:8
```
这样就能达到我们想要的效果了。
==这样删除元素的效率据说会比使用for循环搭配erase删除元素的效率更高，但是我还没有实验过==。

### (4) reverse()与reverse_copy()
**reverse**()用于==逆转范围中的元素顺序==：
```cpp
template<typename _BidirectionalIterator>
inline void reverse(_BidirectionalIterator __first, _BidirectionalIterator __last);
```
这是reverse()的声明：它接收两个迭代器，将该迭代器范围内的元素进行一个反转。
理解的reverse()，那么reverse_copy()从字面意思也能够理解了：
```cpp
template<typename _BidirectionalIterator, typename _OutputIterator>
_OutputIterator reverse_copy(_BidirectionalIterator __first, _BidirectionalIterator __last,
		 _OutputIterator __result);
```
它的第三个参数有点不好理解，我们看看C++官方的手册是如何描述的：[cppreference](https://zh.cppreference.com/w/cpp/algorithm/reverse_copy)![[img/reverse_copy.png]]

## string中的常用字符串操作
### (1) substr()
这个函数用于获取一个字符串的子串：
```cpp
std::string substr (size_t pos = 0, size_t len = npos) const;
```
- pos：指定子串的起始位置。默认为 0，表示从字符串的第一个字符开始
- len：指定子串的长度。==默认值 npos 表示截取到末尾==
- 返回类型为**std::string**，表示从原始字符串中截取的子串

## cctype
### (1) tolower和toupper
**tolower**是==将一个大写字母转换为小写字母==，而**toupper**则是==将一个小写字母转换为大写==：
```cpp
int tolower(int ch);

int toupper(int ch);
```
但是这两个操作都是有一个前置要求：只有英文字母才能完成这个转化，这可以使用函数**isalpha**来检验，因为C/C++中的string是基于**ASCII**的：
```cpp
#include <cctype>
#include <iostream>
using namespace std;
int main(){
	char temp = 'a';
	if(isalpha(temp)){
		cout << (char)toupper(temp);
	}
	return 0;
}
```
记住一定要使用隐式转换，若是没有这个转换的过程，输出的结果将会是相对应字符的ASCII码。
==这两个函数有个优点：可以不用担心大小写问题，如果本就是小写字母，使用tolower是没有影响的，不用但是程序会出错==。

### (2) isupper和islower
这两个函数我们应该能望文生义了吧，上一节中就介绍了toupper和tolower，这两个函数就是==用来判断一个字母它是大写还是小写==：
```cpp
#include <cctype>
#include <iostream>
using namespace std;
int main(){
	cout << isupper('A') << endl;
	cout << isupper('a') << endl;
	// 这个函数允许隐式转换
	cout << isupper(65);
}
```

## climits
这个库千万不要和**limits**搞混了，这是两个不同的库：
- **climits**是**limits.h**的C++版本，其中定义了很多常量，是==C数值极限接口的一部分==
- **limits**是C++11新加入的一个库，里面也有很多能够显示限度的函数和模板，但是我没用过

例如：
```cpp
#include <climits>
CHAR_BIT
INT_MAX
SHORT_MAX
INT_MIN
SHORT_MIN
...
```

## sstream
**stringstream**在这个库中，用于字符串处理。在有的题目中，我们需要对一行输入进行处理，==但是我们却不知道这一行有多少个字符，那该如何呢==？这时候就需要使用stringstream了：
```cpp
#include <sstream>
#include <iostream>
#include <vector>
using namespace std;

int main() {
	string input;
	// 获取一行的输入
	getline(cin, input);

	// 使用input初始化stringstream
	stringstream ss(input);
	int num;
	// 用于存放所有输入
	vector<int> res;
	while(ss >> num) {
		res.push_back(num);
	}

	// 检查下输入
	for(const auto& temp : res)
		cout << temp << " ";
}
```
我们看看终端中的处理情况：
```shell
input:
	1 2 2 3 41 2
output:
	1 2 2 3 41 2
```
在[[https://blog.csdn.net/qq_73725757/article/details/135086592|C++snprintf和stringstream]]和[[https://blog.csdn.net/qq_73725757/article/details/136119325|对stringstream行为的补充]]中，说过stringstream中的相关知识点的，但是似乎没有有关于文件读取的内容，在这里进行个补充吧。
<font color="red"><b>注意：
使用getline()读取数据的时候，会读取到空白行，从而放入string中，因此可能会出现错误，我们需要先对空白行进行处理，如下：</b></font>
```cpp
// 会忽略空白行
cin.ignore();
```

### stringstream的数据读取
stringstream有两种方法读取数据：
1. 第一种在前文中已经说过了，也就是使用**str**()将其转换为string类型，但是这种方法很局限，并没有发挥stringstream的巨大优势
	```cpp
	stringstream ss;
	string input = ss.str();
	```
2. 更常用的方式就是本节所说的，使用“>>”对数据进行读取，==该读取方式，默认是使用“空格（Space）”、”制表符（Tab）“、”换行符（DL）“作为分隔符==，当它读取到末尾的时候，会自动停止，这也是它能够使用while循环的原因
	```cpp
	stringstream ss;
	int num;
	// ss中都是被分隔的int类型的数据
	while(ss >> num) {
		...
	}
	```


[^谓词]:返回值是bool的可调用对象
## function类
它在头文件**functional**和命名空间**std**中，它是一个**通用多态函数包装器**：
>  std::function 的实例能存储、复制及调用任何可复制构造的可调用目标——函数（通过其指针）、 lambda 表达式、 bind 表达式或其他函数对象，还有指向成员函数指针和指向数据成员指针。

在项目中，有如下声明：
```cpp
using Task = std::function<void()>;
```
它的意思就是：==给std::function<void()>取别名，叫做Task==，使其成为一个可调用对象，它可以接受void参数和没有返回值类型的**任意**可调用对象。
这里给出一个示例：
```cpp
#include <functional>
#include <iostream>
using Exmp = std::function<void()>;

void print(){
	std::cout << "Hello functional!" << '\n';
}

int main(){
	Exmp test = print;
	// 或者是 Exmp test(print);
	test();
	return 0;
}
```
能这么写的原因是std::function重载了**函数调用运算符（）**，这也是std::function的底层原理之一。

## 函数默认参数
```cpp
inline threadpool(unsigned short size = 4){}
```
这就是函数提供了默认参数，当函数调用没有提供参数的时候，就默认使用size = 4，若是提供了参数则用size去接收，这里其实还是挺简单的。

## std::runtime_error，throw与try_catch进行异常抛出
这是一个C++**异常类**，通常用于：==**运行时**抛出错误的情况下创建**异常对象**==。
std::runtime_error是**std::exception**的一个子类，std::exception是异常类的**基类**，它有很多的子类，这里就不一一说明了。
==std::runtime_error的构造函数接收一个字符串类型作为参数，该参数用来描述异常的错误信息==。
```cpp
#include <iostream>
#include <stdexcept>

void divideNumbers(int x, int y) {
    if (y == 0) {
        throw std::runtime_error("Error: Divide by zero!");
    }
    std::cout << "Result: " << x / y << std::endl;
}

int main() {
    try {
        divideNumbers(10, 0);
    } catch (const std::runtime_error& ex) {
        std::cout << "Caught exception: " << ex.what() << std::endl;
    }
    
    return 0;
}
```
**<font color="red">throw一定是搭配try_catch进行使用的</font>**，上面这个就是最好的例子。
> 在try中，我们使用作用域包裹可能产生异常的语句，编写一段用于==判断是否会产生异常的语句，并且使用throw抛出异常==。在异常抛出后，try中的语句终止，将语句的执行权转移至相对应的catch语句。并且由于catch语句的参数是一个异常处理类型，而==throw抛出的异常被catch捕获==，转换为对应的异常处理类型，之后就可以进行相对应的异常处理操作了。

<font color="red">std::runtime_error转换为std::exception的过程其实就是C++继承机制的中的”向上转型“，对于这里我还很陌生，需要再花时间去学习</font>。
## C++11可变参数模板
这个内容我一直没有很理解，今天开始就花大量时间将它搞懂吧！
首先，我们需要理解可变参数模板的目的是什么：
> 可变参数模板是为了解决函数或类模板无法处理或限制参数数量，类型和形参的问题而引入的一个新特性。它==允许模板参数数量不确定，使得我们可以传递任意数量和类型的参数==，从而更加灵活和通用。

**<font color="red">它的使用类似函数递归</font>**，下面用一个例子来解释一下：
```cpp
#include <iostream>
#include <functional>

void func(){
	std::cout << " ";
}

template<class T, class... Args>
void func(const T& val, Args... args){
	std::cout << val << " ";
	func(args...);
}

int main(){
	func(1, 2.3, "Hello World");
}
```

我们先看这个模板函数func的声明：
```cpp
template<class T, class... Args>
void func(const T& val, Args... args){
	std::cout << val << " ";
	func(args...);
}
```
- 这个函数拥有两个**模板参数**，其中一个是**模板参数包**（Args）
- 我们将模板参数包抽象为一个类，这个类在使用的时候拥有一个形参，叫做args
- 使用args的时候，由于args是一个可变参数，因此需要加上”**...**“来表示，args是一个可变参数包，它会==将模板参数包 Args 中的模板参数展开为函数模板参数列表==
- 然后将模板参数列表args作为实参再次调用func函数

需要注意的就是最后一步：模板参数列表args作为实参再次调用func函数。在这次调用中，==args又被分为两部分：T和一个新的args==，直到args为空，这时候就会调用之前写的func()（*这个func没有使用模板，并且无传参，它本质上是模板的特化*），这样整个函数就执行完毕了。
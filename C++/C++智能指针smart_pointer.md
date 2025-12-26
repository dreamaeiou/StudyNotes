在C++中，指针分为两种：
- **原始指针**（raw pointer）
- **智能指针**（smart pointer）

原始指针就是C/C++基础中的普通指针，而智能指针是C++11提出的：
> 智能指针是原始指针的封装，其优点是会自动分配内存，不用担心潜在的内存泄露。

只能指针目前有三种：**unique_ptr**、**shared_ptr**和**weak_ptr**，auto_ptr被删除了也就不说了。

==并不是所有指针都可以封装成原始指针==，很多时候原始指针要更方便；并且<font color="red"><b>智能指针只解决了指针的一部分问题，而没有从根本上解决C++内存安全问题，仍然可能造成内存安全问题</b></font>。
在各类指针中，最常用的还是**裸指针**，在是unique_ptr和shared_ptr。
weak_ptr是对shared_ptr的一个补充，应用场景较少。

## 独占指针unique_ptr
从它的名字我们也能够直到它的特点：==在任何时候，都只能有一个指针管理内存==，并且，它利用了**RAII**思想，其生命周期由其作用域控制，当指针超出其作用域时，内存将自动释放。

unique_ptr具有三种创建方式：
1. 通过已有的裸指针创建
2. 通过new创建
3. ==通过std::make_unique()创建==（<font color="red"><b>最推荐的方式</b></font>）

unique_ptr使用**get**函数获取其地址，其使用方式和裸指针的使用方式一样，可以使用“**\***”进行解引用，也可以使用“**->**”进行成员访问。

当unique_ptr作为函数参数或者返回值的时候，一定要注意**所有权**。
> 所有权：对于一个资源（例如内存或对象），能够控制它的创建、使用和销毁的权力。所有权规定了资源在何时被分配和释放。

### unique_ptr与函数
#### **值传递**的时候
由于使用值传递的时候，会创建副本，而unique_ptr是禁用拷贝构造函数的，因此我们需要使用**std::move**来==转移内存所有权==；但是若是我们忘记了使用std::move呢？
	> std::unique_ptr 是 std::move_constructible 和 std::movable 的，这意味着它可以通过 std::move 进行移动构造，并且可以被移动。
	>当你传入一个 std::unique_ptr 到一个函数时，编译器会生成一个该 std::unique_ptr 的副本。这个副本实际上是一个右值引用，即使看起来你传入的是一个左值。因为 std::unique_ptr 的移动构造函数会接受一个右值引用，所以这个副本会被转换为一个右值引用，并调用 std::unique_ptr 的移动构造函数。这样，原始的 std::unique_ptr 会被移动到函数中，而不是复制。
	
#### **引用传递**的时候
==若是将unique_ptr设置为const，表示unique_ptr底层裸指针的指向不能被修改（shared_ptr也是一样的）。
例如：我们不能够使用reset()等

#### 作为函数返回值
1. 因为unique_ptr在出作用域的时候会被销毁，因此需要注意==所有权转移==，在函数返回前就需要将unique_ptr销毁，以避免资源泄露
2. 因为unique_ptr支持**移动语义**，如果函数返回一个unique_ptr而调用者接收一个unique_ptr，它可以安全地接收返回值，因为所有权的转移按照移动语义执行。
3. 避免返回局部对象的引用

### 不推荐使用原有的裸指针进行创建
unique_ptr有三种创建方式，但是第一种我们最好还是不要使用，这里来看一段代码：
```cpp
#include <iostream>
#include <memory>
using namespace std;
int main(){
    int* r_ptr = new int(100);
    unique_ptr<int> u_ptr{r_ptr};

    /*
        查看两者指向的地址
    */
   cout << r_ptr << '\n';
   cout << u_ptr.get() << '\n';
}
```
可以发现，原来的裸指针还指向该地址的同时，智能指针也指向该地址，因此，==unique_ptr实际上没有达到目的：单独维护一个指针==，很容易出现误操作等问题。
若是我们还将裸指针delete了，智能指针中存储的将会空悬挂；如下：
```cpp
#include <iostream>
#include <memory>
using namespace std;
int main(){
    int* r_ptr = new int(100);
    unique_ptr<int> u_ptr{r_ptr};

    /*
        查看两者指向的地址
    */
    cout << r_ptr << '\n';
    cout << u_ptr.get() << '\n';

    // 释放裸指针
    delete r_ptr;
    cout << *u_ptr;
}
```

### 实现一个简单的unique_ptr
以下是我对unique_ptr的一个简单实现：
```cpp
/*
    由于只是为了理解uniuqe_ptr的内部原理
    这里就使用一个文件进行编写了
    这么做不是很规范，但是请允许我偷个懒
*/

#pragma once

#include <iostream>

namespace My_memory{
template<class T>
class My_unique_ptr;

template<class T>
My_unique_ptr<T> make_unique(T creator){
    My_unique_ptr<T> part(new T(creator));
    return part;
}

template<class T>
class My_unique_ptr{
public:
    My_unique_ptr() = delete;
    My_unique_ptr(T* other);
    My_unique_ptr(const My_unique_ptr& other) = delete;
    My_unique_ptr(My_unique_ptr&& other) explicit;
    ~My_unique_ptr();

    void operator=(const My_unique_ptr& other) = delete;
    const T operator*() const;
    const T operator->() const;

    T* get() const;
private:
    // 底层维护的指针
    T* ptr;
};

template <class T>
My_unique_ptr<T>::My_unique_ptr(T *other){
    if(other == nullptr){
        throw std::logic_error("pointing a nullptr");
    }
    else{
        ptr = other;
    }
}

template <class T>
My_unique_ptr<T>::My_unique_ptr(My_unique_ptr &&other){
    if(this->ptr == other.get()){
        throw std::logic_error("Trying to replicate itself");
        return;
    }
    ptr = other.get();
    
}

template <class T>
My_unique_ptr<T>::~My_unique_ptr()
{
    if(ptr != nullptr){
        delete ptr;
        ptr = nullptr;
    }

}

template<class T>
const T My_unique_ptr<T>::operator*() const{
    if(this->get() == nullptr){
            throw std::logic_error("Dereferencing an unallocated My_unique_ptr");
        return T();
    }
    return *(this->get());

}

template <class T>
const T My_unique_ptr<T>::operator->() const{
    if(this->ptr != nullptr){
        return ptr;
    }
    throw std::logic_error("Accessing member of an unallocated My_unique_ptr");
}

template<class T>
T* My_unique_ptr<T>::get() const{
    return this->ptr;
}

}
```
试了下，至少逻辑都没啥问题，大致做到了我想要的结果，只是对比起std，还差挺多，理解了原理应该就行了，附上一段简单的测试代码：
```cpp
#include "my_unique_ptr.h"
#include <iostream>

using namespace My_memory;

int main(){
    My_unique_ptr<int> ptr{new int(10)};
    std::cout << *ptr;

    // 会有重复delete的问题，但我没有去解决这个bug
    // My_unique_ptr<int> ptr2(std::move(ptr));

    My_unique_ptr<int> ptr3 = My_memory::make_unique<int>(10);

    // 会正常报错
    // My_unique_ptr<int> ptr4(ptr3);
}
```

## 计数指针shared_ptr
之前的unique_ptr是独占指针，只允许一个指针指向该地址，并且==它是禁用拷贝的==，而shared_ptr正好相反，它的内部维护了一个计数器，==与其类对象指的内存相关联==。
在copy之后，计数器+1，销毁后计数器-1，当计数器为0的时候，shared_ptr对象销毁。
shared_pr依旧使用get()获取地址，除此之外，使用**use_count**()获取其底部引用计数器的数值。
```cpp
#include <iostream>
#include <memory>
using namespace std;
void function(shared_ptr<int> ptr){
    cout << "进入函数：" << ptr.use_count() << endl;
}

int main(){
    shared_ptr<int> ptr{new int(10)};

    cout << "未进入函数：" << ptr.use_count() << endl;

    function(ptr);

    cout << "退出函数：" << ptr.use_count();
}
```
通过这段代码我们能够看到shared_ptr的计时器的变化，可以帮助理解shared_ptr的原理。

## unique_ptr与shared_ptr
<font color="red"><b>不能将shared_ptr转换为unique_ptr，但是unique_ptr可以通过std::move转换为shared_ptr</b></font>。
==shared_ptr可以是空构造，但是unique_ptr不行==：
```cpp
#include <iostream>
#include <memory>
using namespace std;

unique_ptr<int> function(){
	unique_ptr<int> ptr = std::make_unique<int>(10);
	return ptr;
}

int main(){
	std::shared_ptr<int> sh_ptr = function();
}
```

## weak_ptr弱指针（弱引用）
和unique_ptr和shared_ptr不一样，<font color="red"><b>weak_ptr不拥有所有权，也没法调用成员访问符“->”和解引用符“*”</b></font>。
==但是weak_ptr和shared_ptr紧密关联==，我们先说说shared_ptr所存在的问题吧：**循环引用**。

### 循环引用
什么是循环引用呢？就是对象A其中的成员指针指向了对象B，同时，对象B中的指针又指向了对象A，两者的指针都是shared_ptr，它们都需要等待引用数为0才会销毁。
但是，它们都在相互等待，也就出现了**死锁**。
weak_ptr就是为了解决这个场景提出的。
```cpp
#include <memory>
#include <iostream>
using namespace std;

int main(){
	shared_ptr<int> s_ptr = std::make_shared<int>(10);
    weak_ptr<int> w_ptr(s_ptr);

    // 可以发现，我们通过w_ptr可以正常调用s_ptr
    // 但是count不会增加
    cout << "w_ptr.use_count = " << w_ptr.use_count() << endl;
    cout << "s_ptr.use_count = " << s_ptr.use_count() << endl;
    
    // weak_ptr使用lock()可以转换为shared_ptr
    shared_ptr<int> ch_ptr = w_ptr.lock();
    // 在转换后，shared_ptr的引用计数器增加
    cout << "s_ptr.count = " << ch_ptr.use_count();
}
```
上述代码中就涵盖对weak_ptr的使用：
- 创建weak_ptr的时候需要使用一个已存在的shared_ptr进行初始化，初始化后weak_ptr指向这个shared_ptr所管理的对象，但是shared_ptr的计数器不会增加，因为==weak_ptr不会对其指向的内容进行强引用==。
- weak_ptr使用了**lock**()之后，就会生成一个shared_ptr，就是其指向的shared_ptr，shared_ptr其中的计数器也会+1

接下来看看这段代码：
```cpp
#include <memory>
#include <iostream>
using namespace std;

int main(){
    // shared_ptr<int> s_ptr = make_shared<int>(10);
    weak_ptr<int> w_ptr;
    {
        shared_ptr<int> s_ptr = make_shared<int>(10);
        w_ptr = s_ptr;
        cout << "s_ptr.get = " << s_ptr.get() << endl;
    }
    shared_ptr<int> s_ptr = w_ptr.lock();
    cout << "other s_ptr.get = " << s_ptr.get();
}
```
==当weak_ptr指向的shared_ptr所指向的对象被销毁的时候（这意味着管理该对象的shared_ptr的引用计数为0），weak_ptr会置为nullptr==，这是weak_ptr的一个重要特性，用于避免内存泄漏。
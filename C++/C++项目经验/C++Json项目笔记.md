## 类的提前声明
我觉得这个比较简单，很好理解，因为在C语言中也有类似的语法：
```c
int Temp(struct Exmp& value);
```
其中为什么要加上这个struct？就是为了告诉告诉编译器：我这个类是存在的，只是它不在这个文件中，你先别报错。

## 为什么定义函数的时候同时写左值和右值作为传参？
代码如下：
```cpp
Json(const object& values);
Json(object&& values);
```
**右值**不是可以用于初始化**const左值引用**嘛？为什么还需要单独写一个右值引用版本？

### 解答
其实可以不写，因为==右值可以转换成const左值引用==，但是这会涉及到资源的所有权转移（<font color="red">这里我也不是很了解，后面再补上吧</font>），当我们左值、右值情况都有相对应的函数进行处理的时候，==一旦传入是个右值，就优先触发移动拷贝构造调用，使用**移动语意**，转移资源，减少拷贝==。

## SFINAE机制（疑惑）
什么是**SFINAE机制**呢？这是一个缩写，展开来即：**Substitution Failure Is Not An Error**（替换失败不是错误），SFINAE是std::enable_if的模板别名。
> [!ChatGPT]
> 在 C++ 模板编程中，SFINAE 是一种编译技术，它允许编译器在模板参数推导或重载解析时忽略某些不符合条件的实例化选项，而不会导致编译错误。

代码如下：
```cpp
template<class T, class = decltype(&T::to_json)>
Json(const T& t) : Json(t.to_json()) {}
```
首先**decltype**应该是见过的，和auto一样用于自动类型推断，`class = dacltype(&T::to_json)`就是想在类型T中找到那么个函数`to_json`，如果没找到，就应该换用别的构造函数，而应该报错；也就是说，模板中的第二个参数其实是对类型T的一个限定。

接下来我们再说说`Json(t.to_json)`，由于对**模板元编程**不了解，一开始以为就是C++的**显式初始化列表**，但是想起来没有名为Json的成员变量，所以它的作用应该是：
将`t.to_json`的返回值用于Json构造函数，但是具体是使用哪个重载函数就不一定了，看to_json的结果是什么。

这只是其中一段比较好理解的，还有根本看不懂的，等学了模板元编程再回来补吧：
```cpp
        template<class M, typename std::enable_if<
                std::is_constructible<std::string, decltype(std::declval<M>().begin()->first)>::value
                && std::is_constructible<Json, decltype(std::declval<M>().begin()->second)>::value,
                int>::type = 0>
                        Json(const M& m) : Json(object(m.begin(), m.end())) {}
```

## 指针类型可以被隐式转换成bool类型
==指针可以被隐式转换成bool类型==，这其实也好理解：
> 若是指针指向的是nullptr，则对应的bool类型会是0；
> 否则就是1。

在Json中，有**NULL**这个类型，并且有对应的Json构造函数，因此我们要避免出现异常，就需要禁用这种可能导致异常的隐式转换：
```cpp
Json(void*) = delete;
```

### 能够隐式转换成bool类型的数据
1. **数值类型**。这种情况是最常见的吧，所有的数字0为false，非零值都被认为是1，即为true
2. **指针类型**。此处就属于这个情况，就补过多赘述了
3. **指针和数值类型的比较**。应该也挺好理解吧

## 为什么要同时有number_value和int_value？（疑惑）
其中有两个获取NUMBER类型的值的函数：
```cpp
/*
 * 在该json项目中
 * 不会区分整数和非整数
 * number_value()和int_value()
 * 疑惑：为什么不能就使用一个number_value完成所有操作？
 */
double number_value();
int int_value();
```
命名一个number_value()就能完成所有的任务，为什么还需要后者呢？
原作者也说了，==Json不区分NUMBER是整数还是非整数==。

## 什么时候成员函数需要被声明为静态的？（疑惑）

## size_t和std::string::size_type还是有区别
我们都知道size_t是unsigned int类型，而std::string::size_type也是unsigned int（这是我在初学C++的时候，在《C++primer》中看到的，所以我一直以为这两个就是同一个东西。
> 在大多数情况下，size_t和std::string::size_type是一个东西，因此它们通常可以互换，但是也可能因为平台的不同而出现些许的差异。

因此，为了程序的可移植性，还是使用std::string::size_type会更好，可以避免很多不必要的问题。
<font color="red"><b>总结：最好还是使用C++本身就定义了的东西，特别是在编写库的时候，因为不知道程序会在什么系统中运行，因此，程序的可移植性尤为重要</b></font>。

## 为什么JsonValue的析构函数不是纯虚函数
```cpp
class JsonValue{
protected:
    // 为什么使用的是友元？
    friend class Json;
    friend class JsonInt;
    friend class JsonDouble;

    virtual Json::Type type() const = 0;
    virtual bool equals(const JsonValue* other) const = 0;
    virtual bool less(const JsonValue* other) const = 0;
    virtual void dump(std::string& out) const = 0;
    virtual double number_value() const;
    virtual int int_value() const;
    virtual bool bool_value() const;
    virtual const std::string& string_value() const;
    virtual const Json::array& array_items() const;
    virtual const Json& operator[](size_t i) const;
    virtual const Json::object& object_items() const;
    virtual const Json& operator[](const std::string& key) const;
    virtual ~JsonValue() {}
};
```
不难看出，这个类是一个**抽象类**，这里我就有一个疑问：==为什么析构函数没设置成纯虚的？而是提供了一个空实现？==
因为如果析构函数也设置成了纯虚函数，继承它的所有类都强制需要重写析构函数，但是==**这里提供了空实现的话，就可以使用编译器默认提供的析构函数**==，会省很多事，同时可以避免一些可能的bug。

## snprinf()
```cpp
// 第三个参数用于指定格式化形式
int snprintf(char* str, size_t maxlen, const char* format, ...)
```
之前就看到了这个，说说这个函数的作用吧：
>snprintf函数用于将格式化的数据输出到字符数组中，允许将数据格式化为指定格式的字符串。它以字符数组和格式化的方式工作，是一种基于C语言的函数。

上面提到了**格式化的数据**，什么是格式化的数据呢？就是==将数据以一定格式进行处理==，比如我们在使用printf输出小数的时候，我们能对输出的小数的位数进行规定，就是这个意思。

之前就想到了使用**stringstream**做类似的操作，但是现在看来这里选择使用snprintf()是有道理的。
stringstream由于是不定长的，它是**动态管理内存**，而snprintf()是直接对字符数组进行处理，在传参的时候就已经规定了缓冲区的大小，因此相比起stringstream，它的效率更高。
Json解析对性能有较高要求，因此更适合使用snprintf()，附上源码：
```cpp
static void dump(double value, string &out) {
    if (std::isfinite(value)) {
        char buf[32];
        snprintf(buf, sizeof buf, "%.17g", value);
        out += buf;
    } else {
        out += "null";
    }
}
```

## Json数据中，”"“要进行处理
在对字符串的处理中，有如下内容：
```cpp
if (ch == '"') {
    out += "\\\"";
}
```
>因为在 JSON 格式中，双引号是用来界定字符串值的起始和结束的标记，如果字符串中本身就含有双引号，为避免与 JSON 字符串的双引号冲突，需要进行转义处理。

这里可能需要去看看Json的内容。

## 构造函数非公有（public）（疑惑）
```cpp
template <Json::Type tag, typename T>
class Value : public JsonValue {
protected:

    // Constructors
    explicit Value(const T &value) : m_value(value) {}
    explicit Value(T &&value)      : m_value(move(value)) {}

    // Get type tag
    Json::Type type() const override {
        return tag;
    }

    // Comparisons
    bool equals(const JsonValue * other) const override {
        return m_value == static_cast<const Value<tag, T> *>(other)->m_value;
    }
    bool less(const JsonValue * other) const override {
        return m_value < static_cast<const Value<tag, T> *>(other)->m_value;
    }

    const T m_value;
    void dump(string &out) const override { json11::dump(m_value, out); }
};
```
主要的疑惑就是在这个构造函数上，它被声明为protected的，和private一样==类外无法访问==。
岂不是说，我根本没法创建Value类型的对象？那么，这么做有何用？

### 解答：装饰类，装饰模式
==装饰类是一种设计模式，属于结构性设计设计模式之一==。
在装饰模式中，我们可以动态地给一个对象添加一些额外的职能，而不需继承自子类。这种模式通过创建一个包装类来包裹一个原始类的对象。然后按需扩展其功能。从而实现对对象的功能增强而不改变原有的类结构。
在项目的后面，有很多其它的类继承自该类，如：JsonObject、JsonInt等，这很符合装饰模式的特点。
装饰模式通常具有以下要素：
1. **抽象构件（Component）**：定义了对象的接口，可以是一个抽象类或者接口，声明了对象的基本功能
2. **具体构建（ConcreteComponent）**：实现了抽象构建接口，是被装饰的类
3. **装饰者（Decorator）**：持有一个抽象构件的引用并实现其接口，负责给对象动态添加新的功能
4. **具体装饰者（ConcreteDecorator）**：实现了装饰者的接口，并对具体构件进行装饰。即：扩展或改变核心功能

所以在该项目中，有个最原始的类JsonValue，它用来定义最原始的接口，然后再使用Value进行装饰，最后使用JsonObject等子类对功能进行拓展。

## 为什么右值在传值的时候还需要使用std::move（疑惑）
源码如下：
```cpp
explicit Value(T&& value)       : m_value(move(value)) {}
```
明明接收的就是一个右值，为什么还使用move呢？

## 数据一致性的实现
```cpp
struct Statics {
    const std::shared_ptr<JsonValue> null = make_shared<JsonNull>();
    const std::shared_ptr<JsonValue> t = make_shared<JsonBoolean>(true);
    const std::shared_ptr<JsonValue> f = make_shared<JsonBoolean>(false);
    const string empty_string;
    const vector<Json> empty_vector;
    const map<string, Json> empty_map;
    Statics() {}
};

static const Statics & statics() {
    static const Statics s {};
    return s;
}

static const Json & static_null() {
    // This has to be separate, not in Statics, because Json() accesses statics().null.
    static const Json json_null;
    return json_null;
}
```
在Json数据中，很多地方这些空值需要重复使用，但是只有全局变量使用的是默认值初始化，这个类定义了各种类型的Json数据的初始值和空值，这样可以避免一些隐藏的bug，并且使用静态方法和常量，确保了程序的安全性。
当我们想要初始化一个Json数据的时候，相对应地使用这些已经创建好的数据就行了。

## 匿名命名空间的作用
匿名命名空间==用于限制命名空间内的符号的作用域，使得这些符号只能在当前编译单元内访问，并且避免与其他编译单元或全局作用域内的相同名字的符号发生冲突==。
上文中提到的编译单元就是==指的当前源代码文件==。

>在编译过程中，每个源代码文件会被编译器单独编译成一个**编译单元**，然后这些编译单元最终会被链接，成为可执行文件或者库。（编译将cpp文件变为一个asm文件，然后汇编将asm文件变为一个obj文件，再将obj文件链接为一个exe文件；但是在默认情况下，并不会生成asm文件，而是会直接生成obj文件，可以使用g++的``-S``选项让其生成asm文件）

```cpp
namespace{
	...
}
```
在此处，我们将Json解析的一个类放在这个匿名空间中，用于监控Json解析的状态、进度等
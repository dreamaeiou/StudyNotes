# Java

针对菜鸟Java教程学习的记录

https://www.runoob.com/java/java-tutorial.html



## Java教程

```java
// 第一个JAVA程序
public class Test { // 注意类名与文件名称相同 命名规范以大写字母开头
	public static void main(String[] args) {
		System.out.println("hello");
	}
}

$ javac Test.java
$ java Test
->hello
    
$ java Test.java
->hello
```

```
Q&A:
1.最外层的类可以写成class Test或者private class Test吗?
->最外层(顶级)的类只能用public修饰或无修饰符 public修饰符下要求类名与文件名称相同 无修饰符可以不同

2.如果把static去掉会怎样?
->JVM在加载类的时候 以公有的静态的返回值为空且带有一个字符串参数组的main方法 为程序入口

3.参数为什么要写成数组的形式String可以吗 不写参数可以吗?
不可以 JVM期望有一个特定的签名即public static void main(String[] args) 去掉了参数程序无法启动 

4.println可以写成print吗 区别是什么?
可以 println打印后自动换行 print不换行

5.反编译出来的 Test.class 文件内容是怎样的?
如下

6.为什么反编译出来的.class文件多了一个无参构造方法?
当一个类没有显式定义构造方法时会默认生成无参构造方法 用于初始化对象成员变量 提供默认构造方法
```

```java
// Test.class
//
// Source code recreated from a .class file by IntelliJ IDEA
// (powered by FernFlower decompiler)
//

public class Test {
    public Test() {
    }

    public static void main(String[] var0) {
        System.out.println("hello");
    }
}
```



## Java简介

```
Java的三个体系:
JAVASE(Java2 Platform Standard Edition)平台标准版 --用于桌面程序开发 提供了Swing JAVAFX等的类库
JAVAEE(Java2 Platform Enterprise Edition)企业标准版 --用于web程序的开发 提供了JSP servlet等的类库
JAVAME(Java2 Platform Micro Edition)平台微型版 --用于微型嵌入式物联网程序的开发
```

```
Q&A: (部分问题与JVM有关 在此不作处理)
1.CPP的操作符重载是怎样的? Java中摒弃了这功能那么该如何实现这样类似的功能
```

```cpp
#include <iostream>
using namespace std;

class Number {
public:
    int value; // 存储数值

    // 构造函数，初始化 value
    Number(int val) : value(val) {}

    // 成员函数，用于相加另一个 Number 对象
    Number add(const Number& other) const {
        return Number(this->value + other.value);
    }
};

int main() {
    // 创建两个 Number 对象
    Number num1(5);
    Number num2(10);

    // 使用 add 函数来相加 num1 和 num2
    Number sum = num1.add(num2);

    // 输出结果
    cout << "Sum: " << sum.value << endl;
}
```

```
->上式演示了CPP的操作符重载 即实现了两个自定义类型的值相加的功能(正常情况只能基础类型的值相加)
->Java摒弃了操作符重载 可以通过声明函数来实现类似的功能 如下式
```

```java
public class Number {
    private int value; // 存储数值

    // 构造函数，初始化 value
    public Number(int val) {
        this.value = val;
    }

    // 成员方法，用于相加另一个 Number 对象
    public Number add(Number other) {
        return new Number(this.value + other.value);
    }

    // 为了方便输出，我们重写 toString 方法
    @Override
    public String toString() {
        return Integer.toString(value);
    }

    // 测试该类的 main 方法
    public static void main(String[] args) {
        // 创建两个 Number 对象
        Number num1 = new Number(5);
        Number num2 = new Number(10);

        // 使用 add 方法来相加 num1 和 num2
        Number sum = num1.add(num2);

        // 输出结果 15
        System.out.println("Sum: " + sum);
    }
}
```

```
2.上式中不进行toString方法的重写为什么打印出的是Sum: Number@4148db48 为什么打印出的东西与toString方法有关联
->当println接受到一个对象作为参数 会去调用参数对象的toString()方法来获得一个字符串表示 反编译println对象得到下式(部分)
->若不进行重写 Object继承的toString方法默认以字符串打印(包含对象和哈希码)
```

```java
    /**
     * Prints a String and then terminate the line.  This method behaves as
     * though it invokes {@link #print(String)} and then
     * {@link #println()}.
     *
     * @param x  The {@code String} to be printed.
     */
    public void println(String x) {
        if (getClass() == PrintStream.class) {
            writeln(String.valueOf(x));
        } else {
            synchronized (this) {
                print(x);
                newLine();
            }
        }
    }
```

```
3.CPP中的多继承是怎样的? 多层继承又是怎样的
->如下式CPP代码 Derived类同时继承了两个基类 这种继承称作多继承
->如下式Java代码 child继承parent parent继承grandpa 这种链式的继承称作多层继承
->Java的类单继承 接口可以多继承
```

```cpp
class Base1 {
    // 基类1的成员
};

class Base2 {
    // 基类2的成员
};

class Derived : public Base1, public Base2 {
    // 派生类的成员
};
```

```java
class Grandpa {
    // 祖父类成员
    public void grandpaMethod() {
        System.out.println("This is from Grandpa");
    }
}

class Parent extends Grandpa {
    // 父类成员
    public void parentMethod() {
        System.out.println("This is from Parent");
    }
}

class Child extends Parent {
    // 子类成员
    public void childMethod() {
        System.out.println("This is from Child");
    }
}

public class Main {
    public static void main(String[] args) {
        Child child = new Child();
        
        // Child 可以访问 Grandpa 和 Parent 的公共方法
        child.grandpaMethod(); // 调用来自 Grandpa 的方法
        child.parentMethod();  // 调用来自 Parent 的方法
        child.childMethod();   // 调用 Child 自己的方法
    }
}
```

```
4.CPP中隐式转换(自动的强制类型转换)是怎样的 为什么Java要摒弃?
->如下式 在CPP的隐式转换中 是允许由较长数据类型变成较短数据类型的
->在Java中隐式转换只允许由较长数据类型转成较短数据类型 除非使用强制类型转换 但容易损失精度
```

```cpp
// 基本数据类型的隐式转换
#include <iostream>
using namespace std;

void printDouble(double d) {
    cout << "Double value: " << d << endl;
}

int main() {
    int i = 5;
    float f = 3.14f;
    double d = 2.718;

    // 隐式转换：int -> double
    printDouble(i); // 输出 Double value: 5

    // 隐式转换：float -> double
    printDouble(f); // 输出 Double value: 3.14

    // 直接使用 double 类型
    printDouble(d); // 输出 Double value: 2.718

    return 0;
}
```

```
5.CPP与Java在对指针上的处理
->CPP中指针是一个变量 值是另一个变量的地址 可以直接操作指针访问或修改指向的内存地址
->Java中对象通过引用访问 隐藏了地址细节 不能对指针进行分配
```

```cpp
#include <iostream>
using namespace std;

int main() {
    int a = 10; // 定义一个整数
    int* p = &a; // 定义一个指向整数的指针，并让它指向a

    cout << "Value of a: " << *p << endl; // 解引用指针p，打印a的值
    cout << "Address of a: " << p << endl; // 打印a的地址

    return 0;
}
```

```java
public class Main {
    public static void main(String[] args) {
        Integer a = new Integer(10); // 创建一个新的Integer对象
        Integer refA = a; // 创建一个引用refA指向对象a

        System.out.println("Value of a: " + refA); // 通过引用refA访问a的值

        // 注意：Java中没有直接获取内存地址的操作
    }
}
```



## Java开发环境配置

```
Q&A：
1.为什么变量名称取为JAVA_HOME 在CLASSPATH path分别配置区别是什么？
->变量名JAVA_HOME是一种社区规范 许多工具依赖于JAVA_HOME来找到对应版本
->CLASSPATH用于配置JVM查找.class文件和其他资源文件位置 是Java中特有的环境变量
->path用于配置系统级别的环境变量 用于找到可执行文件位置
```



## Java基础

```
概念：
对象：是类的实例
类：一个模板 描述一类对象的行为状态
方法：类的行为
标识符：类名 变量名 方法名统称
修饰符：修饰类中方法属性
接口：定义派生类方法但不实现

规范：
类名：首字母大写 多个单词组成每个单词首字母大写
方法：首字母小写 多个单词组成除首字母小写其他大写
标识符：A-Z a-z $ _ 任一种开头
```



## Java对象和类

```
Q&A：
1.Java封装的优点有什么 那些不具有封装特性的语言又会出怎样问题？
->Java通过private修饰符将对象的成员变量隐藏起来 防止外部代码直接修改变量 提供访问控制 使代码易于维护
->通过封装让代码具有复用性 加强模块化编程
->C语言结构体不具有封装特性 如下式
```

```C
// 定义一个简单的结构体
struct Point {
    int x;
    int y;
};

// 手动定义的操作函数
void setPoint(struct Point *p, int newX, int newY) {
    p->x = newX; // 直接访问结构体成员
    p->y = newY;
}

int main() {
    struct Point point;
    setPoint(&point, 10, 20);
    
    // 这里可以自由地直接访问和修改 point.x 和 point.y
    point.x = 100; // 不推荐的做法，但C语言允许这样做
    
    return 0;
}
```

```
2.Java匿名类的使用与JS回调函数的异同之处
```

```java
button.addActionListener((e) -> System.out.println("Button clicked!")); // Java8 lambda表达式
```

```OOP
button.addActionListener(new ActionListener() { // OOP 面向对象编程
    @Override
    public void actionPerformed(ActionEvent e) {
        System.out.println("Button clicked!");
    }
});
```

```js
button.addEventListener('click', function(event) { // JS的函数式编程
    console.log('Button clicked!');
});
```

```
3.JS函数是一等公民 为什么在学习过程中反复强调"万物皆对象"
->JS是一种多范式的编程语言 支持多种编程风格 在拥有函数式编程的特性中 也集成了面向对象编程的概念
```

```
4.抽象类和接口在使用上有什么区别吗？
->抽象类更多被继承用于描述类的一部分 单继承 只包含抽象方法
->接口表示拥有怎样的行为 多继承 包含抽象默认静态方法
```



## Java变量类型

```
Q&A：
1.包装类的作用是什么？
->基本数据类型用于存储值 包装类是这些基本类型的表示形式
->在使用ArrayList HashMap时存储的时对象 需要自动装箱将基本数据类型变成包装类 下式是Integer自动装箱实现
```

```java
/**
     * Returns an {@code Integer} instance representing the specified
     * {@code int} value.  If a new {@code Integer} instance is not
     * required, this method should generally be used in preference to
     * the constructor {@link #Integer(int)}, as this method is likely
     * to yield significantly better space and time performance by
     * caching frequently requested values.
     *
     * This method will always cache values in the range -128 to 127,
     * inclusive, and may cache other values outside of this range.
     *
     * @param  i an {@code int} value.
     * @return an {@code Integer} instance representing {@code i}.
     * @since  1.5
     */
    @IntrinsicCandidate
    public static Integer valueOf(int i) {
        if (i >= IntegerCache.low && i <= IntegerCache.high)
            return IntegerCache.cache[i + (-IntegerCache.low)];
        return new Integer(i);
    }
```

```
2.在声明成员变量时使用基本数据类型还是包装类？
->两种均可以使用 使用何种数据类型取决于具体需求
->基本数据类型有默认值 不需要创建对象节省内存 但不能为null 会导致空指针
->包装类可以实现ArrayList中的泛型 可以为null 在开发中框架可能有规定使用
```

```
3.局部变量与成员变量在JVM中的存储方式
->成员变量作为对象的一部分存储在堆内存中 类变量作为类的一部分也存储在堆中 随着类的不被引用被垃圾回收
->局部变量存储在栈帧中 每次调用方法生成一个栈帧 方法完成后从栈帧中弹出
```



## Java修饰符

```
注意：private 与 protected 不能修饰外部类
访问控制修饰符: default public private protected
非访问控制修饰符: abstract final(可被子类继承但不重写) static synchronized volatile transient 
```

```
Q&A：
1.static修饰的方法有什么特征？
->static修饰的方法与变量属于类本身 不需要通过实例化访问 可以通过className.staticMethod访问
->用于工具类 工厂模式如Integer.valueof 辅助函数

2.final修饰的方法有什么特征？
->final修饰的方法任何继承该类的子类都不能重写这个方法
```



## Java Stream、File、IO

```
注意：使用try-with-resources语句 可以自动关闭流
类比：缓冲区的设置与MinIO的分片上传
```

```
Q&A:
1.流每次使用完为什么要主动关闭而不是被GC回收？
->GC只能回收内存资源而不能回收与内存无关的资源 回收具有不定时性
->流的操作涉及到外部资源 GC无法对其直接管理

2.有没有不需要关闭的流？
->ByteArrayOutputStream之类内存流 内部实现是数组 基于内存访问 会被GC回收
->最佳实践仍然是关闭流

3.close()与flush()区别?
->close()关闭流 释放与之关联的资源 在关闭前会确保缓冲数据写入 前置调用flush()
->flush()强制将缓冲区的数据写入底层资源 但不会关闭流
```



## Java Override/Overload

```
重写重载区别：
Override重写 子类存在与父类名字参数个数类型返回值一样
OverLoad重载 类中定义了多个方法名相同 参数数或顺序类型不同
```



## Java抽象类

```
抽象类与接口的区别:
抽象类：不能实例化 可以有构造方法 单继承
接口：不能实例化 只能有抽象方法 成员变量只能是public static final类型的 无静态代码块 多继承
```



## Java数据结构

```
Q&A：
1.List<String> arrayList = new ArrayList<>(); 为什么引用的不是需要实例化的对象？
->使用接口类型作为变量声明是良好的编程实践
->灵活性 可维护性 解耦合 可以将ArrayList换成LinkList 轻松更换底层实现
```



## Java Object

```
Q&A:
1.什么时候用equals 什么时候用==比较
->使用equals:比较对象内容是否相等
->比较基本数据类型值 判断两个对象引用是否指向同一个实例
->如下式
```

```Java
// 使用 == 比较基本数据类型
int a = 5;
int b = 5;
System.out.println(a == b); // 输出: true

// 使用 equals() 比较 String 内容
String str1 = new String("hello");
String str2 = new String("hello");
System.out.println(str1.equals(str2)); // 输出: true
System.out.println(str1 == str2);      // 输出: false，因为它们是不同实例

// String 常量池中的字符串
String str3 = "hello";
String str4 = "hello";
System.out.println(str3 == str4);      // 输出: true，因为它们指向同一常量池中的实例
```


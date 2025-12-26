# 说明
我这个笔记写的不好，有个比较全的网页：[Makefile](https://seisman.github.io/how-to-write-makefile/overview.html)，但是有点难读（对我来说是这样的），因此我在GPT的帮助下重写了下。

## 变量
``makefile``中的变量我的理解就是基本等同于C/C++中的宏：进行文本替换（我这里指的不是``ifndef``那些：
```makefile
CXX = g++
```
使用的时候，若是想使用刚刚定义的变量，就需要使用一个”$“符号：
```makefile
$(CXX) -o test test.cpp
```
类似的，运用变量就能对``makefile``进行一个小升级：==将单独的编译器选项单独放做一个变量==：
```makefile
CXX = g++
CXXFLAGES = -Wall -g -std=c++17

$(CXX) $(CXXFLAGS) -o test test.cpp
```

## 规则
规则由三部分组成：
```makefile
目标: 依赖项
	命令
```
==定义了如何从依赖项生成目标==，其中的依赖项能是很多东西，包括但不限于：文件名、变量、其它目标。

==``makefile``会确保所有的依赖项都被正确地更新和生成==，但是这个是有前提的：若是依赖项是``.o``文件，那么在我的``makefile``中，需要有对应的规则用于更新、生成这个``.o``文件才行，否则是没法自动更新的。

所以，现在，我们的``makefile``又能进一步进行自动化了：
```makefile
CXX = g++
CXXFLAGS = -g -Wall -std=c++17

default: test.cpp
	$(CXX) $(CXXFLAGS) -o text test.cpp

clean:
	rm -rf test
```
``makefile``默认自动执行第一条规则，也就是说，若是我在命令行中敲下``make``，会默认执行``default``这个规则，而我要执行``clean``就要输入``make clean``。

但是，现在还不够自动化，假如我现在添加了文件或者更改了文件名，``test.cpp``换成了``prag.cpp``，那么这个makefile要更改的东西就很多了，所以我们还能进一步进行自动化。

## 自动化变量
自动化变量能让我们的``makefile``进一步自动化，但是它一开始不是很好理解，需要多写，一个个来说。

### $@
这个自动化变量代表的是==该规则中的目标名==，比如说：
```makefile
default: test.cpp
	$(CXX) $(CXXFLAGS) -o text test.cpp
```
其中的目标名是``default``，那么此时，若是我在该规则中使用``$@``，它将被替换为``default``：
```
default: test.cpp
	$(CXX) $(CXXFLAGS) -o $@ test.cpp
```
此时，当我``make``之后，生成的可执行文件名也将会是``default``。

### $^
代表==该规则中所有的依赖项==，这里换个例子来说明：
```makefile
CXX = g++
CXXFLAGS = -Wall -g -std=c++17

compile: test1.cpp test2.cpp
	$(CXX) $(CXXFLAGS) -o $@ $^
```
我这么写就会将``test1.cpp``和``test2.cpp``联合编译为一个名为``compile``的可执行文件，现在若是我又新编写了一个文件，该文件联合已有的两个文件进行编译，此时只需要在该规则后添加上新编写的这个文件名就好了。

### %
该符号不算是自动化变量吧？我也不是很确定，该符号用于定义**模式规则**，比如：
```makefile
%.o: %.cpp
	g++ -c -o $@ $<
```
这个表示：所有以``.cpp``结尾的文件，如何编译成同名``.o``文件，至于其中出现的``$<``，之后会说。

### $<
用来==表示该匹配规则中的第一个依赖文件==，就比如上一个中的，``$<``就代表了它所匹配到的``.cpp``文件。

## 伪目标
伪目标就是指==不会生成文件的规则==，其目的是<font color="red"><b>确保无论是否存在同名文件，Makefile 中的伪目标规则总是会被执行</b></font>。比如常用的``clean``，它只是进行生成的可执行文件的清除，不会有任何的文件生成，因此，应该有个良好的习惯：这种不会生成任何文件，仅仅进行某种操作的规则应当被声明为伪目标：
```makefile
.PHONY: clean

clean:
	rm -rf ./test
```
## 关于input()
在Py中，所有从终端读取的数据都是**str**类型的，也就是C++中的string，因此我们若是想将其转换为其它类型，需要使用转换函数：
```python
# int()就是将类型转换为int的函数
# 所有的内置类型都有类似的转换函数
a = int(input())
```
若是需要转换的内容无法转换成对应的类型呢？就会抛出一个错误：
```python
try:
    a = int(input())
    b = int(input())
    print(a + b)
except ValueError:
    print("Can not change to int")
```
这个错误是ValueError。

在什么时候这段代码会出现错误呢？这和我们的输入有关：==Python中的input()会读取一行的数据==，当我们的输入是：
```shell
1 2
```
的时候，就会出错：a = int("1 2")，这很显然不是能转换成int的类型，但当我们的输入为：
```shell
1
2
```
的时候，就是没问题的。理解了先前为何报错，这里也就很好理解了。

那若是我的输入就是放在一行中，并且是以“空格”作为分隔呢？此时就要对input所读取的字符串进行处理了：
```python
numList = input().split()
a = int(numList[0])
b = int(numList[1])
print(a + b)
```
在这种情况下，可以对输入在同一行的数据进行处理了，但是若是输入数据之间使用了换行符分隔，就会出现数组越界问题。

### input().split()
```python
(method) def split(
    sep: str | None = None,
    maxsplit: SupportsIndex = -1
) -> list[str]
```
这是对于split()的声明，虽然对于这个语法我还十分的陌生，但是也不难理解：==它返回一个list，其中存储的类型是str==。

这里写一个测试代码：
```python
numList = input().split()
print(numList)
```
运行一下：
```shell
# input:
1 2 3
# output
['1', '2', '3']
```
这样应该就很清晰明了。

## output()
### output()类型敏感！
做[数字反转](https://www.luogu.com.cn/problem/P5705)巩固语法的时候，在本地测试一直都没问题，输出都是对的上的：
```python
origin = input()
output = ""
for i in range(len(origin)-1, -1, -1):
    output += origin[i]

print(output)
```
但是提交的时候测试用例一直没有通过，后面将输出进行了一点调整就AC了：
```python
origin = input()
output = ""
for i in range(len(origin)-1, -1, -1):
    output += origin[i]

print(float(output))
```
就是在输出的时候将str转换成了float。
> [!原因]
> ==虽然输出时会将大多数对象转换为字符串，但Python仍然会保留对象的类型信息==。这是为了确保输出的准确性和一致性。例如，如果将浮点数和字符串直接比较，Python会知道它们是不同的类型，因此会返回False。然而，当它们作为输出的一部分时，Python会将它们都转换为字符串以便显示，==但这并不改变它们的原始类型==。所以虽然在输出时会看起来相似，但它们的类型仍然是不同的。

<font color="red"><b>因此说，Python是一个强类型语言，需要跟C++一样，特别注意数据类型</b></font>。

## Python中的数学运算
### 除法
Python中除法分为**整数除法**和**浮点数除法**，在C++中只有普通的除法，数据类型根据除数和被除数来判断：
```python
print(1 / 3)
print(1 // 3)
```
上面这两个是完全不同的意思，不多说，运行下就明白了。
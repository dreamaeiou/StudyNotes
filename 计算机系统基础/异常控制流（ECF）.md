## 控制流的概念
什么是**控制流**？==指令集序列就是“控制流”==，而硬件正在执行的实际指令序列称为“**物理控制流**”。
在通常情况下，控制流在内存中按顺序执行单条指令，但是在[[x86汇编#流程控制|汇编]]中，我们学习了**分支和跳转**、**过程调用和返回**，因此现在它不仅仅只能按照顺序执行指令了。

## 异常
==异常实际上是将低级别的控制权转移到操作系统==：![[img/异常控制流/异常处理.png]]
异常控制流的运行过程分为**发生异常、中断程序执行、异常处理和恢复执行**四个阶段。

1. 发生异常：在程序执行过程中，如果发生了异常情况（如除零错误、内存访问越界等），系统会检测到异常并触发相应的异常处理机制。

2. 中断程序执行：当异常发生时，系统会中断当前程序的正常执行流程，并保存当前程序的执行状态（如程序计数器、栈指针等），同时跳转到异常处理程序执行。

3. 异常处理：异常处理程序会根据异常类型和优先级来进行相应的处理，例如打印错误信息、记录异常日志、尝试恢复程序执行状态等。异常处理程序的执行过程直接影响到系统对异常的处理结果。

4. 恢复执行：在异常处理程序执行完毕后，系统会根据异常处理程序的结果来决定是否需要恢复程序的执行状态。如果异常处理程序成功处理异常情况，并且决定继续执行原程序，系统会根据异常处理程序的指示来恢复程序的执行状态，并继续原程序的执行流程。

在上图中，还体现了一点：==在异常发生时，程序的控制权会从用户空间跳转至内核空间进行异常处理==。

## 异常表
![[img/异常控制流/异常表.png]]
> [!过程描述]
> 当有一个异常事件k发生的时候，**硬件**会使用这个k作为索引去查找**异常表**，从而==获得该异常的处理程序的地址==。

## 异常分类
异常分为两种：**同步异常**和**异步异常**

### 异步异常
==异步异常是由于处理器外部发生的状态变化而引起的==，也被称为“**中断**”。这种异常通过==在处理器上设置引脚，来向处理器通知状态变化==，而这个引脚也被称为”**中断引脚**“。
在终端执行后，会返回“**next**”（在上面的图片中出现过），即：继续执行程序的下一条指令。因此，<font color="red"><b>中断会影响程序的执行流程，但不会影响程序的整体运行</b></font>。

### 同步异常
![[img/异常控制流/同步异常.png]]
#### 陷阱（Traps）
陷阱是==故意的异常==（由程序*故意*引起的），最常见的形式就是**系统调用**。系统调用和函数调用不同的是：==系统调用会将程序的控制权转移到内核中，而函数调用则仍是在用户空间===。

#### 故障（Fault）
上面说到：陷阱是故意的异常，而==故障是无意的异常==，它可能是可恢复的。
当出现故障的时候，运行对应的故障排除程序可能可以使其恢复正常。

#### 中止（Abort）
中止是==无意的和不可恢复的==，它是那些：总是中止的异常。比如程序执行了非法指令、奇偶校验误差等。

## 进程
==进程是正在运行的程序的实例==，我们可以认为一个进程代表一个**逻辑控制流**。
进程提供了两个关键的抽象：
1. 给你==它独占CPU和寄存器的幻觉==，这使得在程序运行的时候，永远不需要担心其它应用程序会修改寄存器，并且你甚至不知道有其它程序正在同时运行
2. ==你感觉拥有自己的地址空间==，这个是虚拟内存机制所提供的。每个运行中的程序都有自己的堆、栈、代码区、数据区

很早之前我们就听说过**上写文切换**这个词，但是一直不知道它是什么，在这里做一个详细的解释。

### 上下文切换
什么是上下文切换？
在操作系统的实际运行中，往往同时运行着多个进程。此处以单核CPU来进行解释：![[img/异常控制流/上下文切换.png]]
图中的每个“内存+CPU”就表示一个进程，当出现了“**陷阱**”或其它异常的时候，程序需要将控制权转移至另一个进程，此时就需要==保存进程的状态：包括寄存器的值和内存地址==，然后加载下一个进程的状态，并转移程序控制权。
因此，<font color="red"><b>上下文切换其实就是状态的切换，而上下文切换的过程交由操作系统内核完成</b></font>：![[img/异常控制流/上下文切换 1.png]]

### 并发和并行
在[[../操作系统/第一章#并发|操作系统]]中，就已经区分了什么是**并发**什么是**并行**，这里再做一个更直观的解释：
- 并发：![[img/异常控制流/并发.png]]
- 并行：![[img/异常控制流/并行.png]]

### 进程的三种运行状态
![[img/异常控制流/程序的三种运行状态.png]]要注意分清**暂停（Stopped）和终止（Terminated）**，前者可恢复为运行状态，而后者则不可再恢复。

### fork()、getpid()、getppid()、wait()、exit()
fork()是Linux提供的系统调用，用于==创建**子进程**==，fork()有返回值，为int，不同的返回值具有不同的作用：
- 若是返回值为小于0的数，说明创建失败，通常发生在内存不足的时候
- 若是返回值为0，说明此时==正在运行子进程==
- 若是返回值大于0，说明此时运行的是父进程，而==返回值就是子进程的PID==

创建了子进程后，程序的执行顺序是得不到保证的：可能是先执行子进程中的内容，也可能是先执行父进程中的内容。并且，==子进程和父进程所执行的代码是完全相同的==，若是我们希望两个进程执行不一样的代码呢？根据上面fork()的返回值，我们就能够对代码进行处理：
```c
int main()
 {
    pid_t pid;
    int x = 1;
    pid = Fork(); 
    if (pid == 0) {  /* Child */
        printf("child : x=%d\n", ++x); 
exit(0);
    }
    /* Parent */
    printf("parent: x=%d\n", --x); 
    exit(0);
 }
```
我们能够通过一个**进程图**（Process Graph）来理解它：![[img/异常控制流/进程图1.png]]
在上图中，进程通过调用exit()来终止，==exit()会负责对进程的资源进行回收==。若是我们没有调用exit()呢？子进程的资源就==会在父进程结束的时候被**init进程**回收==，==这个init()进程是一个特殊的进程，专门用于子进程的回收==。
但是，使用了exit()之后，子进程的资源就一定被释放了吗？其实并不是这样的：
> [!资料]
> 即使子进程调用了 exit() 退出，它所占用的系统资源会被操作系统回收，但其退出状态信息需要被父进程获取并处理。这是因为==操作系统会在子进程退出时将其状态信息保存在内核的进程表中，直到父进程调用 wait() 或 waitpid() 函数来主动获取这些信息==。如果父进程不主动获取子进程的退出状态，那么子进程就会成为**僵尸进程**，<font color="red"><b>其资源并不会完全释放</b></font>。
> 
  父进程获取子进程的退出状态后，操作系统就会释放子进程的所有资源，并从进程表中删除子进程的条目，从而确保资源被正确回收，同时也避免了僵尸进程的产生。
  >
  因此，父进程需要负责处理子进程的退出状态，以确保系统资源的正确释放，同时也为了避免僵尸进程的出现。

这里再做一个总结吧：==僵尸进程其实是该进程完成了任务并且正常结束了，资源也得到了正常释放，但是由于父进程不知道其退出状态，因而内核表中仍存在子进程的相关信息，也就是部分资源没有释放干净==，只有当父进程使用**wait**()、**waitpid**()等函数获取子进程的状态信息后，删除内核中进程表中的子进程项，整个资源才算释放完毕。（<font color="red"><b>僵尸进程并不实际上占用系统资源，但是它们会占用一个进程表的条目</b></font>）

```cpp
#include <unistd.h>
#include <stdio.h>
#include <stdlib.h>
int main() {
  pid_t pid = fork();
  // 在子进程中
  if(pid == 0) {
    printf("Children Process Running, PID:%d\n", getpid());
    exit(0);
  }

  printf("Parent Process Running, PID:%d\n", getpid());
  while(true);
}
```
运行后使用ps查看进程信息：![[img/异常控制流/僵尸进程.png]]
能看到出现了一个被标记为**defunct**的僵尸进程。

---

#### exit()
上文中提到，程序为终止状态的时候是不可恢复的，在一般的程序中，main函数的返回值就表示了程序的最终状态，在正常情况下，main函数的返回值为0，就表示程序正常退出。
除了main函数的返回值能正常退出外，我们还能够通过exit()函数来终止进程：exit()具有一个参数，该参数就表示进程的退出状态：
```c
void exit(int status);
```
==exit()被调用一次，但永远不会返回==，也就是说，调用exit后，进程就退出了，main函数不会运行到return语句，也就没有返回值了。
<font color="red"><b>exit()和return的进程状态信息都是能够被父进程获取的</b></font>。

#### wait()和waitpid()
先前说到，若是创建了子进程，但是在子进程退出后，父进程仍在运行并且没有对子进程的状态信息进行处理，就会导致僵尸进程的产生。
==wait()会阻塞当前进程（父进程）的执行，它等待某一个子进程退出，并且注销其进程表的相关信息==，它的主要任务就是这个。可以看看它的声明：
```c
#include <wait.h>

pid_t wait(int* chilren_status);
```
它接收一个指针，这个指针用于接收==子进程的退出状态信息，而返回值则是退出的子进程的PID==：
- 若是返回值为-1，则说明wait()调用失败，例如：当前进程已无子进程，或者是某种原因导致的调用失败
- 而返回值PID也仅仅是告诉我们它操作的是哪个进程，而不是用来操作子进程的

wait()会等待任意一个尚未被wait()系统调用处理的子进程退出。如果父进程有多个子进程，并且依次调用wait()，那么每个wait()都会等待一个不同的子进程。如果父进程调用了一个wait()，那么它会等待那个最先退出的子进程，然后是下一个，依此类推。
wait()的操作实际由操作系统内核完成，因此对我们是不可见的。
```c
void fork9() {
    int child_status;
    if (fork() == 0) {
        printf("HC: hello from child\n");
 exit(0);
    } else {
        printf("HP: hello from parent\n");
        wait(&child_status);
        printf("CT: child has terminated\n");
    }
    printf("Bye\n");
 }
```
该代码的进程图如下：
![[img/异常控制流/进程图2.png]]

waitpid()和wait()不同的是，==前者可以通过PID对特定的进程进行操作==：
```c
pid_t waitpid(pid_t pid, int& status, int options);
```
对于这个函数，在《CSAPP》中有详细描述，在课上就没说了。

<font color="red">在<b>wait.h</b>中，还有很多和进程处理相关的宏，只知道wait()和waitpid()是不太够的</font>。

### execve()
先前所说的==fork()仅仅是拷贝了一个父进程的副本进行执行==，若是我们想执行别的程序，可以使用**execve**()，它会==加载并执行传入的可执行文件名==：
```c
int execve(char* filename, char* argv[], char* envp[]);
```
- filename：文件名，可以是二进制可执行文件，也可是脚本文件等
- 第二个参数在[[../C++/C++Linux编程基础#exec函数族|C++Linux编程基础]]中有提过，跟我们执行程序是一样的，这里再强调一下：<font color="red"><b>argv[0]是可执行文件的名称</b></font>
- envp：是一个指向环境变量的指针数组，用于传递给新程序的环境变量。环境变量以key=value的形式存储在数组中，每个环境变量以null结尾，整个数组以一个额外的null指针结束
- 返回值：如果调用出现故障或者文件不存在，就会返回-1

在进程调用execve()之后，==该程序就被所调用的那个程序完全覆盖了==，这是从根源上的覆盖：堆、栈、数据区、文本区全部进行了覆盖，但它的进程仍然没变，只是更改了运行在此进程上的程序（<font color="red"><b>这是通过更换进程的内存映像来实现的</b></font>）。
这种形式通常是==调用一次并且永不返回==。
因此它的使用应该在子进程中：
<font color="sky-blue"><b>示例：</b></font>
```c
// 此处的Fork()就是经过我们自己包装的fork()
if ((pid = Fork()) == 0) {   /* Child runs program */
    if (execve(myargv[0], myargv, environ) < 0) {
        printf("%s: Command not found.\n", myargv[0]);
        exit(1);                                   
	}                                   
}  
```
![[img/异常控制流/execve示例.png]]

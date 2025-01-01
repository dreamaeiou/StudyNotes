 ## KMP的含义以及作用
KMP的含义很简单，就是开创这个算法的三个人的名字的缩写而已，没什么好纠结的。
KMP算法是字符串匹配算法，==高效地在一个字符串中找出某个字串==。
一般来说，我们想在一个字符串中查找一个字串可能会使用暴力查找；
```cpp
/* 
	朴素的字符串匹配算法
*/
int findSub(string s, string target){
	for(int i=0; i<s.size(); i++){\
		int j;
		for(j=0; j<target.size(); j++){
			if(s[i+j] != target[j]){
				i = position;
				break;
			}
		}
		if(j == target.size()){
			return i;
		}
	}
	return -1;
}
```
这样暴力查找的时间复杂度是多少呢？**O(s.size() \* trarget.size())**，时间复杂度还是很高的。
因此我们此时应该换一种算法，而此处介绍的KMP算法就是一种经典的字符串匹配算法。
KMP算法的核心是生成一个**部分匹配表**，这个部分匹配表能够告诉我们在已经扫描过的字符中，是否有部分匹配的？若是有，我们可以直接利用这个已经匹配了的部分，而不像暴力搜索那样，只要有错就重新开始。
==这个部分匹配表也就是KMP算法的核心==。

## KMP算法的核心——next数组的生成
上面说到，KMP算法的核心就是**部分匹配表**，这个表在实际中我们能叫他**next数组**或**profix数组**：![[img/KMP部分匹配表.png]]
上图就是一个next数组和其字符的对应关系。
这里就要先说说几个专有名词了：
- 文本串：被匹配的文本串
- 模式串：需要进行匹配的字串
- next数组：即部分匹配表

==KMP算法的难点就在于求解next数组==，先说说这个next数组是怎么得到的吧。
在博主“代码随想录”的视频中，对于next数组的获取有这么一段话：

> [!NOTE]
> 找到这个模式串中，当前字符之前的字符串的**最长相同前后缀**，其长度就是该字符对应的next值。

而这个next值意味着什么呢？意味着：==当某一个字符出现不匹配的情况时，我们可以跳过多少个字符，这部分字符我们先前已经匹配过了，KMP算法具有一个记忆性，这个记忆性由next值提供==。
这就是KMP算法能用优化的主要原因。
并且，对于KMP算法，==在文本串上的指针永远不会回退，它只会一直前进==，但是在朴素的字符串匹配算法中，若是出现了字符串不匹配的情况，会有一个回退过程，这样就导致了效率的降低：
![[img/朴素字符串匹配.png]]
> 在上图中，由于==i+j处==的字符串匹配出现了问题，进入下一次匹配，i到了i+1，但是i+1在i~i+j这个范围内，再次范围内实际上已经进行了一次匹配（扫描），这就相当于i指针进行了**回退操作**，这就导致了效率的损失。

我们说到next是KMP算法的核心，那么它怎么进行计算呢？我们需要找该字符之前所有字符的**最长相同前后缀**（<font color="red"><b>注意：字符串的前缀是指不包含最后一个字符的所有以第一个字符开头的连续子串；后缀是指不包含第一个字符的所有以最后一个字符结尾的连续子串</b></font>）。
<font color="sky-blue">例如：</font>现在我想知道aabaaf的next数组：
![[img/aabaaf求next数组.jpg]]
过程就类似这种，可能会有点繁琐。最后得到的答案应该是”**010120**“。

而我们做题其实可以只记住一些结论就好了，==但是·由于这部分结论我不知道怎么表述，就直接用KMP算法模板体现吧==。接下来我给出KMP算法的模板。

## KMP算法模板
```cpp
/*
	生成next数组
*/
vector<int> figueOutNext(int target){
	vector<int> next(target.size(), 0);
	int j = 0;
	for(int i = 1; i < target.size(); i++){
		while(j > 0 && target[i] == target[j]){
			// 进行回调，找前一个字符的最长相同前缀
			// 若是回调后，位置上的字符仍不匹配
			// 继续回调，直到j=0（回到了next数组的头部）
			j = next[j-1];
		}
		if(target[i] == target[j]){
			// 若是两个字符相等
			// 说明还是相同前缀
			j++;
		}
		// 设定此时的i的next值
		next[i] = j;
	}
	return  next;
}
```
上面这个函数用于生成next数组，可以发现：==i指针是没有回退的！它始终在向前走，回退由j完成，这也是KMP算法的精髓之一==：
```cpp
bool KMP(string s, string target){
	vector<int>next = figueOutNext(target);

	// 文本串指针
	int position = 0;
	// 模式串指针
	int position2 = 0;
	while(position < s.size() && position2 < target.size()){
		if(s[position] == target[position2]){
			// 匹配上了，一起向后移动
			position++;
			position2++;
		}
		else{
			if(position2 == 0){
				// 第一个字符就没匹配上，直接后移就行
				position++;
			}
			else{
				// 利用next数组的性质
				// 模式串回退进行重新匹配
				position2 = next[position2 - 1];
			}
		}
		if(position2 == target.size()){
		return true;
		}
	}
	return false;
}
```
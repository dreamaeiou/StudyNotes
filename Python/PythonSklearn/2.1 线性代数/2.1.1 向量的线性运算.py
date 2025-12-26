import numpy as np

a = np.array([1, 2, 3]).reshape(-1, 1)
# reshape(-1, 1)方法将其转换为一个二维数组，其中-1表示自动计算该维度的大小，以使数组的总元素数量保持不变。
# 结果是3行1列的二维数组。
print(a.shape,"\n---------")
print(a,"\n---------")

b = np.array([4, 5, 6]).reshape(-1, 1)
print(b,"\n---------")
print(a + b,"\n---------")
print(a - b,"\n---------")
print(a * b,"\n---------")
print(a / b,"\n---------")

import numpy as np

# 矩阵的转换
a = np.mat([[1, 2], [3, 4]])
print(a,"\n----------")

b = np.array([[1, 2], [3, 4]])
print(b,"\n----------")

c = np.asmatrix(b)
b[0,0] = 5

print(c,"\n--------------------")

# 矩阵的线性运算
d = np.array([[1, 2], [3, 4]])
print(d,"\n----------")

e = np.array([[1, 2], [3, 4]])
e = np.mat([[1, 2], [3, 4]])
print(e,"\n----------")

f = np.mat([[1, 1], [1, 1]])
print(f,"\n----------")

print(e - f,"\n----------")
print(e + f,"\n----------")

f = np.mat([[5, 6], [7, 8]])
print(e * f,"\n--------------------")

e = np.mat([[1, 2, 3], [4, 5, 6]])
f = np.mat([[1, 2], [3, 4], [5, 6]])
print(e * f,"\n----------")
print(f * a,"\n----------")

print(np.dot(e,f),"\n----------")
print(np.dot(f,e),"\n----------")

print(e @ f,"\n----------")
print(f @ e,"\n----------")

# 构建单位矩阵
p = np.mat(np.eye(4))
print(p,"\n----------")

# 行列式计算
A = np.mat([[1, 0, 3], [2, 0, 1], [3, 3, 5]])
print(np.linalg.det(A),"\n----------")

A = np.mat([[1, -1, 2, -3, 1], [-3, 3, -7, 9, -5], [2, 0, 4, -2, 1], [3, -5, 7, -14, 6], [4, -4, 10, -10, 2]])
print(np.linalg.det(A),"\n----------")

# 逆矩阵计算
A = np.mat([[2, 3, 1], [0, 1, 3], [1, 2, 5]])
print(np.linalg.inv(A),"\n----------")
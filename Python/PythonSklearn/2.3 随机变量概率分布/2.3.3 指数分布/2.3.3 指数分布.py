import numpy as np
import matplotlib.pyplot as plt
# import math
from scipy import stats

plt.rcParams['font.sans-serif'] = ['SimHei'] # 用来正常显示中文标签
plt.rcParams['axes.unicode_minus'] = False # 用来正常显示负号

r = 1 / 50000
X = []
Y = []
for x in np.linspace(0, 1000000, 100000):
    if x == 0:
        continue
    # 直接用公式计算
    # p = r * math.e ** (-r * x)
    p = stats.expon.pdf(x, scale = 1/r)
    X.append(x)
    Y.append(p)
plt.plot(X, Y)
plt.xlabel("间隔时间")
plt.ylabel("概率密度")
plt.savefig("指数分布.png")
plt.show()
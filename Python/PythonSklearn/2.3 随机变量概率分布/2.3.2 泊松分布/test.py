import numpy as np

# 设置泊松分布的参数 λ
lam = 5

# 重复计算 5000 次
num_trials = 5000

# 初始化计数器
count = 0

# 进行 5000 次试验
for _ in range(num_trials):
    # 生成一组随机数
    X = np.random.poisson(lam=lam, size=10000)
    # 计算 X 大于等于 2 的次数
    count += np.sum(X >= 2)

# 计算概率
probability = count / (num_trials * 10000)

print(f"泊松分布参数 λ={lam} 时，X≥2 的概率为：{probability}")
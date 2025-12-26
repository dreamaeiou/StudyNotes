import numpy as np
import matplotlib.pyplot as plt
import scipy.stats as stats

n = np.arange(-50, 50)
mean = 0
normal = stats.norm.pdf(n, mean, 10)
plt.plot(n, normal)
plt.xlabel('Distribution', fontsize=12)
plt.ylabel('Probability', fontsize=12)
plt.title("normal Distribution")
plt.savefig("normal.png")
plt.show()
import numpy as np
import matplotlib.pyplot as plt
from scipy import stats

for prob in range(3, 10, 3):
    x = np.arange(0, 25)
    binom = stats.binom.pmf(x, 20, 0.1*prob)
    plt.plot(x, binom, '-o', label="p = {:f}".format(0.1*prob))
    plt.xlabel('Random Variable', fontsize=12)
    plt.ylabel('Probability', fontsize=12)
    plt.title("Binomial Distribution varying p")
    plt.legend()
plt.savefig("binomial_distribution.png")
plt.show()
import numpy as np
import matplotlib.pyplot as plt

X = np.random.poisson(lam=5, size=10000) # lam 为λ，size 为i
s = plt.hist(X, bins=15, range=[0, 15], color='g', alpha=0.5)
plt.plot(s[1][0:15], s[0], 'r')
plt.grid()
plt.show()
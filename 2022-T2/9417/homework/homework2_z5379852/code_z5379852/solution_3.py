import numpy as np
import matplotlib.pyplot as plt

# b
bias1 = []
var1 = []
bias2 = []
var2 = []
for i in range(2, 251):
    bias_new = -2 * 1
    bias_mle = -1/i
    var_new = 2*1/(i-1)
    var_mle = 2*(i-1)/(i**2)
    bias1.append(bias_new)
    bias2.append(bias_mle)
    var1.append(var_new)
    var2.append(var_mle)
dot = np.linspace(2, 250, num=249)
plt.plot(dot, bias1, linewidth=1, color='orange', label='NEW')
plt.plot(dot, bias2, linewidth=1, color='green', label='MLE')
plt.legend(loc=0)
plt.show()
plt.plot(dot, var1, linewidth=1, color='orange', label='NEW')
plt.plot(dot, var2, linewidth=1, color='green', label='MLE')
plt.legend(loc=0)
plt.show()

# c
mse1 = []
mse2 = []
for j in range(2, 251):
    mse_new = var1[j-2] + bias1[j-2]**2
    mse_mle = var2[j - 2] + bias2[j - 2] ** 2
    mse1.append(mse_new)
    mse2.append(mse_mle)
plt.plot(dot, mse1, linewidth=1, color='orange', label='NEW')
plt.plot(dot, mse2, linewidth=1, color='green', label='MLE')
plt.legend(loc=0)
plt.show()

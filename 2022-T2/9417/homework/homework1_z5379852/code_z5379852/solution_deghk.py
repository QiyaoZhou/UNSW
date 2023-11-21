import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.linear_model import Ridge
import numpy as np
import matplotlib.pyplot as plt
from sklearn.metrics import mean_squared_error

# question(d)
cs_df = pd.read_csv("CarSeats.csv")
cs_df = cs_df.drop(['ShelveLoc', 'Urban', 'US'], axis=1)
X = cs_df.iloc[:, 1:]
Y = cs_df.iloc[:, 0]
scaler = StandardScaler().fit(X)
scaled_X = scaler.transform(X)
print(f"Feature Means: {scaled_X.mean(axis=0)}")
print(f"Feature Variances: {scaled_X.var(axis=0)}")
Y = Y - Y.mean()
'''X_train, X_test, Y_train, Y_test = train_test_split(scaled_X, Y, test_size=0.5)'''
split_point = scaled_X.shape[0] // 2
X_train = scaled_X[:split_point]
X_test = scaled_X[split_point:]
Y_train = Y[:split_point].to_numpy()
Y_test = Y[split_point:].to_numpy()
print(X_train[0])
print(X_train[-1])
print(X_test[0])
print(X_test[-1])
print(Y_train[0])
print(Y_train[-1])
print(Y_test[0])
print(Y_test[-1])

# question(e)
n = X_train.shape[0]
p = X_train.shape[1]
ridge = Ridge(alpha=0.5 * n, fit_intercept=True).fit(X_train, Y_train)
print(ridge.coef_)

# question(g)
beta = ridge.coef_
los0 = (beta.T @ X_train.T @ X_train @ beta - 2 * beta.T @ X_train.T @ Y_train + Y_train.T @ Y_train
        + X_train.shape[1] * 0.5 * beta.T @ beta) / X_train.shape[1]
lr = [0.000001, 0.000005, 0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.005, 0.01]
result1 = []
Y_train_a = Y_train
beta = np.ones((X_train.shape[1], 1))
for i in range(len(lr)):
    process = []
    beta = np.ones((X_train.shape[1], 1))
    for j in range(1000):
        grad1 = (X_train.T @ X_train + X_train.shape[1] * 0.5 * np.eye(X_train.shape[1])) @ beta
        grad2 = X_train.T @ Y_train_a
        grad = (grad1.T - grad2) * 2 / X_train.shape[1]
        beta = beta - grad.T * lr[i]
        los = (beta.T @ X_train.T @ X_train @ beta - 2 * beta.T @ X_train.T @ Y_train + Y_train.T @ Y_train
               + X_train.shape[1] * 0.5 * beta.T @ beta) / X_train.shape[1]
        s = (los - los0).tolist()[0]
        process.append(s)
        if i == 5 and j == 999:
            beta_GD = beta
    process = np.array(process)
    result1.append(process)
result1 = np.array(result1)
dot = np.linspace(1, 1000, num=1000)
for i in range(9):
    plt.subplot(3, 3, i + 1)
    plt.plot(dot, result1[i], linewidth=1)
    plt.title(f"$lr={lr[i]:f}$", fontsize=10, loc='center', color='purple')
plt.show()
print('The train MSE: %f' % mean_squared_error(Y_train, X_train @ beta_GD))
print('The test MSE: %f' % mean_squared_error(Y_test, X_test @ beta_GD))

'''# question(h)
lr = [0.000001, 0.000005, 0.00001, 0.00005, 0.0001, 0.0005, 0.001, 0.006, 0.02]
beta = np.ones((X_train.shape[1], 1))
result2 = []
for i in range(len(lr)):
    process = []
    beta = np.ones((X_train.shape[1], 1))
    for k in range(5):
        for j in range(len(X_train)):
            batch = X_train[j]
            batch_y = Y_train_a[j]
            grad1 = (batch.T @ batch + X_train.shape[1] * 0.5 * np.eye(X_train.shape[1])) @ beta
            grad2 = batch.T * batch_y
            grad = (grad1.T - grad2) * 2 / X_train.shape[1]
            beta = beta - grad.T * lr[i]
            los = (batch_y-batch@ beta)/ X_train.shape[1] + 0.5 * beta.T @ beta
            s = (los - los0).tolist()
            process.append(s)
            if i == 8 and k == 4 and j == 199:
                beta_SGD = beta
    process = np.array(process)
    result2.append(process)
result2 = np.array(result2)
for i in range(9):
    plt.subplot(3, 3, i + 1)
    for j in range(7):
        plt.plot(dot, result2[i], linewidth=1)
        plt.title(f"$lr={lr[i]:f}$", fontsize=10, loc='center', color='purple')
plt.show()
print('The train MSE: %f' % mean_squared_error(Y_train, X_train @ beta_SGD))
print('The test MSE: %f' % mean_squared_error(Y_test, X_test @ beta_SGD))

# question(k)
beta = np.ones((X_train.shape[1], 1))
result3 = []
process = []
for i in range(10):
    for j in range(X_train.shape[1]):
        beta_new = np.linalg.inv(X_train.T@X_train+ X_train.shape[1]*0.5*np.eye(X_train.shape[1]))@X_train.T@Y_train_a
        beta[j] = beta_new[j]
        los = (beta.T @ X_train.T @ X_train @ beta - 2 * beta.T @ X_train.T @ Y_train
               + Y_train.T @ Y_train +X_train.shape[1] * 0.5 * beta.T @ beta) / X_train.shape[1]
        s = (los - los0).tolist()[0]
        result3.append(s)
result3 = np.array(result3)
dot2 = np.linspace(1, 70, num=70)
for j in range(70):
    plt.plot(dot2, result3, linewidth=1)
plt.show()
print('The train MSE: %f' % mean_squared_error(Y_train, X_train @ beta))
print('The test MSE: %f' % mean_squared_error(Y_test, X_test @ beta))
result_GD = result1[5, 0:70]
result_SGD = result2[8, 0:70]
result_NEW = result3
plt.plot(dot2, result_GD, linewidth=1, color='orange', label='GD')
plt.plot(dot2, result_SGD, linewidth=1, color='green', label='SGD')
plt.plot(dot2, result_NEW, linewidth=1, color='blue', label='NEW')
plt.legend(loc=0)
plt.show()'''

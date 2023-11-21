import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import log_loss
import matplotlib.pyplot as plt

# d
data = pd.read_csv('songs.csv')
remove_features = ['Artist Name', 'Track Name', 'key', 'mode', 'time_signature', 'instrumentalness']
data = data.drop(remove_features, axis=1)
data = data.loc[(data["Class"] == 5) | (data["Class"] == 9)]
data = data.dropna()
data.loc[data.Class == 5, 'Class'] = 1
data.loc[data.Class == 9, 'Class'] = 0
X_train, X_test, Y_train, Y_test = train_test_split(data.iloc[:, 0:-1].to_numpy(), data.iloc[:, -1].to_numpy(),
                                                    test_size=0.3, random_state=23)
scaler = StandardScaler()
scaler.fit(X_train)
X_train = scaler.transform(X_train)
X_test = scaler.transform(X_test)
print(f"first row X_train:{X_train[0][0:3]}")
print(f"last row X_train:{X_train[-1][0:3]}")
print(f"first row X_test:{X_test[0][0:3]}")
print(f"last row X_test:{X_test[-1][0:3]}")
print(f"first row y_train:{Y_train[0]}")
print(f"last row y_train:{Y_train[-1]}")
print(f"first row y_test:{Y_test[0]}")
print(f"last row y_test:{Y_test[-1]}")


# e
def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def loss_function(data_x, label, weights, lam):
    norm_beta_sq = np.linalg.norm(weights[1:], ord=2) ** 2
    z = np.dot(data_x, weights)
    sig_z = sigmoid(z)
    return lam * log_loss(label, sig_z, normalize=True) + 0.5 * norm_beta_sq


init_alpha = 1
a = 0.5
b = 0.8
n = X_train.shape[1]
beta1 = np.zeros((n + 1, 1))
la = 0.5
epoch = 60
loss_list1 = []
step_size_list1 = []
X_train = np.insert(X_train, 0, 1, axis=1)
Y_train = Y_train.reshape(2720, 1)
for i in range(epoch):
    loss_num = loss_function(X_train, Y_train, beta1, la)
    grad = beta1 + la * X_train.T @ (sigmoid(X_train @ beta1) - Y_train) / X_train.shape[0]
    grad[0] = grad[0] - beta1[0]
    alpha = init_alpha
    while True:
        x1 = loss_function(X_train, Y_train, beta1, la)
        x2 = loss_function(X_train, Y_train, beta1 - alpha * grad, la)
        y = a * alpha * (np.linalg.norm(grad, ord=2) ** 2)
        if x1 - x2 < y:
            alpha = alpha * b
        else:
            break
    beta1 = beta1 - alpha * grad
    loss_list1.append(loss_num)
    step_size_list1.append(alpha)
X_test = np.insert(X_test, 0, 1, axis=1)
Y_test = Y_test.reshape(1166, 1)
train_loss1 = loss_function(X_train, Y_train, beta1, la)
test_loss1 = loss_function(X_test, Y_test, beta1, la)
print(f"Train lost:{train_loss1}")
print(f"Test lost:{test_loss1}")
dot = np.linspace(1, 60, num=60)
plt.subplot(1, 2, 1)
plt.plot(dot, loss_list1, linewidth=1)
plt.subplot(1, 2, 2)
plt.plot(dot, step_size_list1, linewidth=1)
plt.show()

# f
beta2 = np.zeros((n + 1, 1))
loss_list2 = []
step_size_list2 = []
for i in range(epoch):
    loss_num = loss_function(X_train, Y_train, beta2, la)
    grad = beta2 + la * X_train.T @ (sigmoid(X_train @ beta2) - Y_train) / X_train.shape[0]
    grad[0] = grad[0] - beta2[0]
    h = sigmoid(X_train @ beta2)
    m = X_train.shape[0]
    l2 = np.eye(n+1)
    l2[0][0] = 0
    order = la / m * ((X_train.T @ np.diag(h.reshape(m)))@np.diag((1-h).reshape(m)))@X_train + l2
    alpha = init_alpha
    while True:
        x1 = loss_function(X_train, Y_train, beta2, la)
        x2 = loss_function(X_train, Y_train, beta2 - alpha * grad, la)
        y = a * alpha * (np.linalg.norm(grad, ord=2) ** 2)
        if x1 - x2 < y:
            alpha = alpha * b
        else:
            break
    beta2 = beta2 - alpha * np.dot(np.linalg.inv(order), grad)
    loss_list2.append(loss_num)
    step_size_list2.append(alpha)
train_loss2 = loss_function(X_train, Y_train, beta2, la)
test_loss2 = loss_function(X_test, Y_test, beta2, la)
print(f"Train lost:{train_loss2}")
print(f"Test lost:{test_loss2}")
dot = np.linspace(1, 60, num=60)
plt.subplot(1, 2, 1)
plt.plot(dot, loss_list2, linewidth=1)
plt.subplot(1, 2, 2)
plt.plot(dot, step_size_list2, linewidth=1)
plt.show()
plt.plot(dot, loss_list1, linewidth=1, color='orange', label='GD')
plt.plot(dot, loss_list2, linewidth=1, color='green', label='NT')
plt.show()

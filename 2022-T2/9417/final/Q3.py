from sklearn.tree import DecisionTreeRegressor
import numpy as np 
import matplotlib.pyplot as plt


def f(x):
    t1 = np.sqrt(x * (1-x))
    t2 = (2.1 * np.pi) / (x + 0.05)
    t3 = np.sin(t2)
    return t1*t3


def f_sampler(f, n=100, sigma=0.05):    
    # sample points from function f with Gaussian noise (0,sigma**2)
    xvals = np.random.uniform(low=0, high=1, size=n)
    yvals = f(xvals) + sigma * np.random.normal(0,1,size=n)

    return xvals, yvals


def predict(n_estimators, learning_rate, estimators, X):
    H = np.ones(X.shape[0]) * H0
    for k in range(n_estimators):
        estimator = estimators[k]
        y_predict = estimator.predict(X)
        H += learning_rate * y_predict
    return H


def predict2(n_estimators, learning_rate, estimators, X):
    H = np.ones(X.shape[0]) * H0
    for k in range(n_estimators):
        estimator = estimators[k]
        y_predict = estimator.predict(X)
        H += learning_rate[k] * y_predict
    return H


np.random.seed(123)
X, y = f_sampler(f, 160, sigma=0.2)
X = X.reshape(-1,1)

# (c)
fig, ax = plt.subplots(5,2)
for i, ax in enumerate(ax.flat):
    n_estimators = 5*(i+1)
    learning_rate = 0.1
    H0 = np.average(y)
    H = np.ones(X.shape[0]) * H0
    estimators = []
    for k in range(n_estimators):
        y_hat = y - H
        dt = DecisionTreeRegressor(max_depth=1)
        dt.fit(X, y_hat)
        y_predict = dt.predict(X)
        H += learning_rate * y_predict
        estimators.append(dt)
    estimators = np.array(estimators)
    xx = np.linspace(0, 1, 1000)
    ax.plot(xx, f(xx), alpha=0.5, color='red', label='truth')
    ax.scatter(X, y, marker='x', color='blue', label='observed')
    ax.plot(xx, predict(n_estimators, learning_rate, estimators, xx.reshape(-1, 1)), color='green', label='dt')
    title = 'n = '+str(n_estimators)
    ax.set_title(title)
# plt.legend(loc='upper right')
plt.show()

fig, ax = plt.subplots(5,2)
for i, ax in enumerate(ax.flat):
    n_estimators = 5*(i+1)
    H0 = np.average(y)
    H = np.ones(X.shape[0]) * H0
    estimators = []
    learning_rates = []
    for k in range(n_estimators):
        y_hat = y - H
        dt = DecisionTreeRegressor(max_depth=1)
        dt.fit(X, y_hat)
        y_predict = dt.predict(X)
        learning_rate = np.dot(y_predict,y_hat)/np.dot(y_predict,y_predict.T)
        H += learning_rate * y_predict
        estimators.append(dt)
        learning_rates.append(learning_rate)
    estimators = np.array(estimators)
    xx = np.linspace(0, 1, 1000)
    ax.plot(xx, f(xx), alpha=0.5, color='red', label='truth')
    ax.scatter(X, y, marker='x', color='blue', label='observed')
    ax.plot(xx, predict2(n_estimators, learning_rates, estimators, xx.reshape(-1, 1)), color='green', label='dt')
    title = 'n = '+str(n_estimators)
    ax.set_title(title)
# plt.legend(loc='upper right')
plt.show()

# (d)
fig, ax = plt.subplots(5,2)
for i, ax in enumerate(ax.flat):
    n_estimators = 5*(i+1)
    learning_rate = 0.1
    H0 = np.average(y)
    H = np.ones(X.shape[0]) * H0
    estimators = []
    for k in range(n_estimators):
        y_hat = y - H
        dt = DecisionTreeRegressor(max_depth=2)
        dt.fit(X, y_hat)
        y_predict = dt.predict(X)
        H += learning_rate * y_predict
        estimators.append(dt)
    estimators = np.array(estimators)
    xx = np.linspace(0, 1, 1000)
    ax.plot(xx, f(xx), alpha=0.5, color='red', label='truth')
    ax.scatter(X, y, marker='x', color='blue', label='observed')
    ax.plot(xx, predict(n_estimators, learning_rate, estimators, xx.reshape(-1, 1)), color='green', label='dt')
    title = 'n = '+str(n_estimators)
    ax.set_title(title)
# plt.legend(loc='upper right')
plt.show()

fig, ax = plt.subplots(5,2)
for i, ax in enumerate(ax.flat):
    n_estimators = 5*(i+1)
    H0 = np.average(y)
    H = np.ones(X.shape[0]) * H0
    estimators = []
    learning_rates = []
    for k in range(n_estimators):
        y_hat = y - H
        dt = DecisionTreeRegressor(max_depth=2)
        dt.fit(X, y_hat)
        y_predict = dt.predict(X)
        learning_rate = np.dot(y_predict,y_hat)/np.dot(y_predict,y_predict.T)
        H += learning_rate * y_predict
        estimators.append(dt)
        learning_rates.append(learning_rate)
    estimators = np.array(estimators)
    xx = np.linspace(0, 1, 1000)
    ax.plot(xx, f(xx), alpha=0.5, color='red', label='truth')
    ax.scatter(X, y, marker='x', color='blue', label='observed')
    ax.plot(xx, predict2(n_estimators, learning_rates, estimators, xx.reshape(-1, 1)), color='green', label='dt')
    title = 'n = '+str(n_estimators)
    ax.set_title(title)
# plt.legend(loc='upper right')
plt.show()

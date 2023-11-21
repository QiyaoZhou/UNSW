import numpy as np
import matplotlib.pyplot as plt
from sklearn import svm

# (i)
X = [[1, 0], [0, 1], [0, -1], [-1, 0], [0, 2], [0, -2], [-2, 0]]
Y = [-1, -1, -1, 1, 1, 1, 1]

X_t = []
for i in range(7):
    x1 = 2*X[i][1]**2 - 4*X[i][0] + 1
    x2 = X[i][0]**2 - 2*X[i][1] - 3
    X_t.append([x1,x2])

X = np.array(X)
Y = np.array(Y)
X_t = np.array(X_t)
clf = svm.SVC(C=7, kernel='linear')
clf.fit(X_t, Y)
h = 0.01
x_min, x_max = X_t[:, 0].min() - 1, X_t[:, 0].max() + 1
y_min, y_max = X_t[:, 1].min() - 1, X_t[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, h),np.arange(y_min, y_max, h))
plt.xlim(xx.min(), xx.max())
plt.ylim(yy.min(), yy.max())
plt.xticks(())
plt.yticks(())
Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)
plt.contourf(xx, yy, Z, cmap='hot', alpha=0.5)
plt.scatter(X_t[:, 0], X_t[:, 1], c=Y, cmap=plt.cm.Paired)
plt.show()

# (ii)
print('the indices of my identified support vectors:')
print(clf.support_vectors_)
print('estimated values:')
print(clf.predict(X_t))
print('error:')
print(1-clf.score(X_t, Y))

# (iii)
clf = svm.SVC(C=7, kernel='poly', degree=2, coef0=2)
clf.fit(X, Y)
print('the indices of my identified support vectors:')
print(clf.support_vectors_)
print('estimated values:')
print(clf.predict(X))
print('error:')
print(1-clf.score(X, Y))

# (iv)
h = 0.01
x_min, x_max = X[:, 0].min() - 1, X[:, 0].max() + 1
y_min, y_max = X[:, 1].min() - 1, X[:, 1].max() + 1
xx, yy = np.meshgrid(np.arange(x_min, x_max, h),np.arange(y_min, y_max, h))
plt.xlim(xx.min(), xx.max())
plt.ylim(yy.min(), yy.max())
plt.xticks(())
plt.yticks(())
Z = clf.predict(np.c_[xx.ravel(), yy.ravel()])
Z = Z.reshape(xx.shape)
plt.contourf(xx, yy, Z, cmap='hot', alpha=0.5)
plt.scatter(X[:, 0], X[:, 1], c=Y, cmap=plt.cm.Paired)
plt.show()

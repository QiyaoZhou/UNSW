from mpl_toolkits import mplot3d
import numpy as np
import matplotlib.pyplot as plt


def func(a, b):
    return (b - a ** 2) ** 2 * 100 + (1 - a) ** 2


# b
x = np.linspace(-5, 5, 100)
y = np.linspace(-5, 5, 100)
X, Y = np.meshgrid(x, y)
Z = func(X, Y)
fig = plt.figure(figsize=(10, 10))
# ax = mplot3d.Axes3D(fig)
ax = plt.axes(projection='3d')
ax.plot_surface(X, Y, Z)
plt.show()

# c
x0 = np.array([[-1.2], [1]])
count = 0
while True:
    hess = np.array([[1200 * x0[0][0]**2 - 400 * x0[1][0] + 2, -400 * x0[0][0]],
                    [-400 * x0[0][0], 200]])
    hess = np.array(hess, dtype='float')
    hess_inv = np.linalg.inv(hess)
    grad = np.array([[x0[0][0]**3 * 400 - 400 * x0[0][0] * x0[1][0] + 2 * x0[0][0] - 2],
                    [200 * x0[1][0] - 200 * x0[0][0]**2]])
    if np.linalg.norm(grad, 2) <= 0.000001:
        break
    x0 = x0 - np.dot(hess_inv, grad)
    count += 1
    print(count, ':', x0.T[0])

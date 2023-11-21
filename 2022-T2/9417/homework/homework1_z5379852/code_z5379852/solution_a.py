import numpy as np

A = np.array([[1, 2, 1, -1],
              [-1, 1, 0, 2],
              [0, -1, -2, 1]])
x = np.array([1, 1, 1, 1])
b = np.array([3, 2, -2])

result = np.array([1, 1, 1, 1])
check = 1

while check == 1:
    grad = A.T@(A@x - b) + 0.2*x
    if np.linalg.norm(grad) < 0.001:
        check = 0
    else:
        x = x - 0.1*grad
        result = np.vstack([result, x])

result = np.around(result, decimals=4)

for i in range(6):
    print(f'k = {i}, x(k) = {result[i]}')

for j in range(5):
    print(f'k = {len(result) - j - 1}, x(k) = {result[len(result) - j - 1]}')


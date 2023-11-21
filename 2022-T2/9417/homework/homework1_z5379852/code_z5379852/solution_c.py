import torch
from torch import nn, optim
A = torch.Tensor([[1, 2, 1, -1],
                  [-1, 1, 0, 2],
                  [0, -1, -2, 1]])
b = torch.Tensor([[3], [2], [-2]])
tol = 0.001
gamma = 0.2
alpha = 0.1
x = torch.Tensor([[1], [1], [1], [1]])


class MyModel(nn.Module):
    def __init__(self):
        super().__init__()
        self.x_tensor = nn.Parameter(torch.ones(size=[4,1], requires_grad=True))

    def forward(self, A_tensor):
        return A_tensor@self.x_tensor


model = MyModel()
optimizer = optim.SGD(model.parameters(), lr=alpha)
loss_func = nn.MSELoss(reduction='sum')
terminationCond = False
x_list = []
while not terminationCond:
    pred = model(A)
    loss = loss_func(pred, b)/2 + gamma/2*(model.x_tensor.norm(2)**2)
    loss.backward()
    optimizer.step()
    check = model.x_tensor.grad.norm(2)
    optimizer.zero_grad()
    x_list.append(model.x_tensor.data.tolist())
    if check < tol:
        terminationCond = True

result = []
for i in range(len(x_list)):
    zs = []
    for j in x_list[i]:
        zs.append(round(j[0],4))
    result.append(zs)

for i in range(6):
    print(f'k = {i}, x(k) =', end='')
    print(result[i])

for j in range(5):
    print(f'k = {len(result) - j - 1}, x(k) =', end='')
    print(result[len(result) - j - 1])

import os
from PIL import Image
import numpy as np

def convert_label(img_path, txt_path):
    img_blue = np.array(Image.open(img_path))[:, :, 2]
    x, y = img_blue.shape
    labels = np.unique(img_blue)[1:]
    lines = ""
    for _ in labels:
        for i in range(0, x):
            for j in range(0, y):
                if img_blue[i][j] == _:
                    bottom = i  
        for i in range(x-1, -1, -1):
            for j in range(0, y):
                if img_blue[i][j] == _:
                    top = i  
        for i in range(0, y):
            for j in range(0, x):
                if img_blue[j][i] == _:
                   right = i   
        for i in range(y-1, -1, -1):
            for j in range(0, x):
                if img_blue[j][i] == _:
                    left = i   
        x_center = str((right + left) / (2 * y))
        y_center = str((bottom + top) / (2 * x))        
        width = str((right - left) / y)
        height = str((bottom - top) / x)
        line = " ".join(("0", x_center, y_center, width, height, "\n"))
        lines += line
    with open(txt_path, "w") as f:
        f.write(lines[:-1])

cur_dir = os.path.dirname(os.path.realpath(__file__))
label_root = os.path.join(cur_dir, "datasets/panoptic_maps/train")
labeldirs = os.listdir(label_root)

for _ in labeldirs:
    if 'text' in _:
        continue
    path_img = os.path.join(label_root, _)
    path_txt = os.path.join(label_root, _ + '_text')
    if not os.path.exists(path_txt):
        os.makedirs(path_txt)
    imgs = os.listdir(path_img)
    for img_name in imgs:
        img_path = os.path.join(path_img, img_name)
        txt_path = os.path.join(path_txt, img_name.split('.')[0]+'.txt')
        convert_label(img_path, txt_path)
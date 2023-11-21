import os
import glob
import numpy as np
import pandas as pd
import random
import shutil
import warnings
from sklearn.metrics import mean_squared_error
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
import torch
from sklearn.linear_model import SGDRegressor

pd.set_option('display.max_rows', 5)
pd.set_option('display.max_columns', 5)
pd.set_option('float_format', '{:f}'.format)
np.set_printoptions(suppress=True)
warnings.filterwarnings('ignore')

districts = pd.read_csv('D:/UNSW/2022-T2/9417/project/districts_info.csv')
products = pd.read_csv('D:/UNSW/2022-T2/9417/project/products_info.csv')
for dirname, _, filenames in os.walk('./engagement_data'):
    for filename in filenames:
        engagement_files = list(glob.glob(os.path.join(dirname, '*.*')))
engagement = pd.DataFrame()
engagement_list = []
for file in engagement_files:
    district_id = file[-8:-4]
    engagement_file = pd.read_csv(file)
    eng_mean = engagement_file["engagement_index"].mean()
    engagement_list.append([district_id,eng_mean])
engagement_df = pd.DataFrame(engagement_list)
engagement_df.columns = ["id","eng_mean"]
engagement_df['id'] = engagement_df['id'].astype(int)

mapping_1 = {
    '[0, 0.2[': 0.1,
    '[0.2, 0.4[': 0.3,
    '[0.4, 0.6[': 0.5,
    '[0.6, 0.8[': 0.7,
    '[0.8, 1[': 0.9}

mapping_2 = {
    '[4000, 6000[': 5000,
    '[6000, 8000[': 7000,
    '[8000, 10000[': 9000,
    '[10000, 12000[': 11000,
    '[12000, 14000[': 13000,
    '[14000, 16000[': 15000,
    '[16000, 18000[': 17000,
    '[18000, 20000[': 19000,
    '[20000, 22000[': 21000,
    '[22000, 24000[': 23000,
    '[32000, 34000[': 33000}

mapping_3 = {
    '[0.18, 1[': 0.59,
    '[1, 2[': 1.50}

mapping_4 = {
    'Rural': 1,
    'Town': 2,
    'Suburb': 3,
    'City': 4}

districts['pct_black/hispanic'] = districts['pct_black/hispanic'].map(mapping_1)
districts['pct_free/reduced'] = districts['pct_free/reduced'].map(mapping_1)
districts['county_connections_ratio'] = districts['county_connections_ratio'].map(mapping_3)
districts['pp_total_raw'] = districts['pp_total_raw'].map(mapping_2)
districts['locale'] = districts['locale'].map(mapping_4)

merged = engagement_df.copy()
merged['id'] = merged['id'].astype('int64')
merged = merged.merge(districts, left_on='id', right_on='district_id', how='left')
remove_features = ['id','state','district_id']
merged = merged.drop(remove_features, axis=1)

merged.fillna(merged.mean(),inplace=True)
X = merged.iloc[:, 1:]
Y = merged.iloc[:, 0]
scaler = StandardScaler().fit(X)
scaled_X = scaler.transform(X)
Y = Y - Y.mean()
X_train, X_test, Y_train, Y_test = train_test_split(scaled_X, Y, test_size=0.2)

X_train = torch.tensor(X_train)
Y_train = torch.tensor(Y_train.tolist())
X_test = torch.tensor(X_test)
Y_test = torch.tensor(Y_test.tolist())
X_train = X_train.to(torch.float32)

sgd = SGDRegressor(loss='squared_error')
sgd.fit(X_train, Y_train)
print(sgd.coef_)
print('The train MSE: %f' % mean_squared_error(Y_train, X_train @ sgd.coef_))
print('The test MSE: %f' % mean_squared_error(Y_test, X_test @ sgd.coef_))

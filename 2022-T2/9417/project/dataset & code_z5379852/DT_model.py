import os
import glob
import numpy as np
import pandas as pd
import warnings
from sklearn import tree
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report

pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
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
remove_features = ['id','state','district_id','county_connections_ratio']
merged = merged.drop(remove_features, axis=1)

data = merged.dropna(axis=0)
X = data.iloc[:, 1:]
Y = data.iloc[:, 0]
print(Y.describe())
Y = pd.cut(Y,bins=[0,84.13,153.64,209.53,577.64],labels=['very low', 'low', 'average', 'high'])
X_train, X_test, Y_train, Y_test = train_test_split(X, Y, test_size=0.2)
clf = tree.DecisionTreeClassifier(criterion='entropy')
model = clf.fit(X_train,Y_train)
Y_pred = model.predict(X_test)
print(classification_report(Y_test,Y_pred))

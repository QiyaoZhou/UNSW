import os
import glob
import pandas as pd
import warnings
import matplotlib.pyplot as plt
import seaborn as sns

pd.set_option('display.max_rows', None)
pd.set_option('display.max_columns', None)
pd.set_option('float_format', '{:f}'.format)
warnings.filterwarnings('ignore')

districts = pd.read_csv('./districts_info.csv')
products = pd.read_csv('./products_info.csv')
for dirname, _, filenames in os.walk('./engagement_data'):
    for filename in filenames:
        engagement_files = list(glob.glob(os.path.join(dirname, '*.*')))
engagement = pd.DataFrame()
for file in engagement_files:
    district_id = file[-8:-4]
    engagement_file = pd.read_csv(file)
    engagement_file['id'] = district_id
    engagement = pd.concat([engagement, engagement_file], axis=0).reset_index(drop=True)

# 4.1 Data volume observation
print('districts:')
print(f'Number of rows: {districts.shape[0]}  Number of columns: {districts.shape[1]}')
print('products:')
print(f'Number of rows: {products.shape[0]}  Number of columns: {products.shape[1]}')
print('engagement:')
print(f'Number of rows: {engagement.shape[0]}  Number of columns: {engagement.shape[1]}')

# 4.2 Missing value check
print(districts.isnull().sum())
print(products.isnull().sum())
print(engagement.isnull().sum())

# 4.3 Statistical analysis of data
sns.countplot(y="state",data=districts,order=districts.state.value_counts().index)
plt.title("State Distribution")
sns.despine()
plt.show()

labels = list(districts.locale.value_counts().index)
size = districts.locale.value_counts().values
plt.pie(size, labels=labels, autopct='%3.1f%%')
plt.title('Locale Type Distribution')
plt.show()

sns.countplot(data=products, y="Provider/Company Name", order=products['Provider/Company Name'].value_counts().index[:10])
plt.title('Top 10 Provider Platform with the Most Product in 2020')
sns.despine()
plt.show()

data = products.groupby('Sector(s)').count()[['LP ID']].reset_index().sort_values(by="LP ID", ascending=False)
sns.barplot(data=data, x="Sector(s)", y="LP ID")
plt.title('Products Sector Distribution')
plt.xlabel('Company Name')
sns.despine()
plt.show()

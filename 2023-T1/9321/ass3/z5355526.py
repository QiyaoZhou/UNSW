import sys
from math import exp

import  pandas as pd
import  numpy as np
from sklearn.preprocessing import OneHotEncoder
from sklearn.preprocessing import StandardScaler
from sklearn.feature_selection import SelectKBest
from sklearn.feature_selection import f_regression,f_classif
from sklearn.model_selection import train_test_split
from sklearn.ensemble import GradientBoostingRegressor
from scipy.stats import pearsonr
from sklearn.metrics import classification_report
from sklearn import tree




train_data = pd.read_csv(sys.argv[1],sep="\t")
test_data = pd.read_csv(sys.argv[2],sep="\t")

one_hot_encoder = OneHotEncoder()
for col in train_data.select_dtypes("object").columns:
  transformed_data = one_hot_encoder.fit_transform(train_data[[col]])

  col_names = one_hot_encoder.get_feature_names_out([col])
  train_data = pd.concat([train_data, pd.DataFrame(transformed_data.toarray(), columns=col_names)], axis=1)
  train_data = train_data.drop(col, axis=1)

one_hot_encoder = OneHotEncoder()
for col in test_data.select_dtypes("object").columns:
  transformed_data = one_hot_encoder.fit_transform(test_data[[col]])

  col_names = one_hot_encoder.get_feature_names_out([col])
  test_data = pd.concat([test_data, pd.DataFrame(transformed_data.toarray(), columns=col_names)], axis=1)
  test_data = test_data.drop(col, axis=1)


regression_y_train = train_data["revenue"]
regression_x_train = train_data.drop("revenue",axis = 1)
class_y_train = train_data["rating"]
class_x_train = train_data.drop("rating",axis = 1)




selector_reg = SelectKBest(f_regression,k = 20)
selector_reg.fit_transform(regression_x_train,regression_y_train)
selected_features_mask = selector_reg.get_support()
selected_features_names = regression_x_train.columns[selected_features_mask].tolist()
regression_x_train = regression_x_train[regression_x_train.columns[selector_reg.get_support()]]



selector_cla = SelectKBest(f_classif,k = 26)
selector_cla.fit_transform(class_x_train,class_y_train)
selected_features_mask_cla = selector_cla.get_support()
selected_features_names_cla = class_x_train.columns[selected_features_mask_cla].tolist()
class_x_train = class_x_train[class_x_train.columns[selector_cla.get_support()]]


scaler = StandardScaler()
x_train_reg = scaler.fit_transform(regression_x_train)
y_train_reg = np.log(regression_y_train)

X_train_reg, X_vali_reg, Y_train_reg, Y_vali_reg = train_test_split(x_train_reg, y_train_reg, test_size=0.2)
X_train_cla, X_vali_cla, Y_train_cla, Y_vali_cla = train_test_split(class_x_train, class_y_train, test_size=0.2)

regression_y_test = test_data["revenue"]
regression_x_test = test_data.drop("revenue",axis = 1)


regression_x_test = regression_x_test[selected_features_names]

x_test_reg = scaler.fit_transform(regression_x_test)
y_test_reg = np.log(regression_y_test)


model_reg= GradientBoostingRegressor(max_depth =6,n_estimators = 800,learning_rate=0.2)
model_reg.fit(X_train_reg,Y_train_reg)
prediction_reg = model_reg.predict(x_test_reg)
print(pearsonr(y_test_reg,prediction_reg)[0])


class_y_test = test_data["rating"]
class_x_test = test_data.drop("rating",axis = 1)
class_x_test = class_x_test[selected_features_names_cla]
model_cla = tree.DecisionTreeClassifier(criterion="entropy",max_depth = 20)
model_cla.fit(X_train_cla,Y_train_cla)
prediction_cla = model_cla.predict(class_x_test)
report = classification_report(class_y_test,prediction_cla,output_dict = True)
print(report["accuracy"])
print(report["macro avg"]["f1-score"])

with open("z5355526.PART1.output.csv","w")as f:
  f.write("predicted_revenue\n")
  for items in prediction_reg:
    f.write(f"{int(exp(items))}\n")

with open("z5355526.PART2.output.csv","w")as f:
  f.write("predicted_rating\n")
  for items in prediction_cla:
    f.write(f"{int(items)}\n")

import sys
from math import exp
import pandas as pd
import numpy as np
from sklearn.ensemble import GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.feature_selection import f_regression, f_classif, SelectKBest
from scipy.stats import pearsonr
from sklearn import tree
from sklearn.metrics import classification_report


def main():

    train_data = pd.read_csv(sys.argv[1], sep='\t')
    test_data = pd.read_csv(sys.argv[2], sep='\t')
    one_hot_df = pd.get_dummies(train_data, columns=['ATM_Zone', 'ATM_Placement', 'ATM_TYPE', 'ATM_Location_TYPE', 'ATM_looks', 'ATM_Attached_to', 'Day_Type'])
    Y_reg = one_hot_df['revenue']
    Y_cla = one_hot_df['rating']
    X = one_hot_df.drop(['revenue', 'rating'], axis=1)

    selector1 = SelectKBest(f_regression, k=16)
    selector1.fit(X, Y_reg)
    top_features1 = X.columns[selector1.get_support()].tolist()
    X_reg = X[top_features1]

    selector2 = SelectKBest(f_classif, k=25)
    selector2.fit(X, Y_cla)
    top_features2 = X.columns[selector2.get_support()].tolist()
    X_cla = X[top_features2]
    scaler = StandardScaler().fit(X_reg)
    scaled_X_reg = scaler.transform(X_reg)

    Y_reg = np.log(Y_reg)

    X_train_reg, X_test_reg, Y_train_reg, Y_test_reg = train_test_split(scaled_X_reg, Y_reg, test_size=0.2)
    X_train_cla, X_test_cla, Y_train_cla, Y_test_cla = train_test_split(X_cla, Y_cla, test_size=0.2)

    model = GradientBoostingRegressor(n_estimators=1000, max_depth=7)
    model.fit(X_train_reg, Y_train_reg)
    # y_pred1 = model.predict(X_test_reg)
    # print(pearsonr(Y_test_reg, y_pred1)[0])

    model2 = tree.DecisionTreeClassifier(criterion="entropy")
    model2.fit(X_train_cla, Y_train_cla)
    # y_pred2 = model2.predict(X_test_cla)
    # print(classification_report(Y_test_cla, y_pred2, output_dict=True))

    test_df = pd.get_dummies(test_data, columns=['ATM_Zone', 'ATM_Placement', 'ATM_TYPE', 'ATM_Location_TYPE', 'ATM_looks', 'ATM_Attached_to', 'Day_Type'])
    test_Y_reg = test_df['revenue']
    test_Y_cla = test_df['rating']
    test_X = test_df.drop(['revenue', 'rating'], axis=1)
    test_X_reg = test_X[top_features1]
    test_X_cla = test_X[top_features2]
    scaler_test_X_reg = scaler.transform(test_X_reg)
    y_pred1 = model.predict(scaler_test_X_reg)
    test_Y_reg = np.log(test_Y_reg)
    print(pearsonr(test_Y_reg, y_pred1)[0])
    y_pred2 = model2.predict(test_X_cla)
    report = classification_report(test_Y_cla, y_pred2, output_dict=True)
    print(report['accuracy'])
    print(report['macro avg']['recall'])
    print(report['macro avg']['f1-score'])
    with open("z5379852.PART1.output.csv", "w") as f:
        f.write("predicted_revenue\n")
        for value in y_pred1:
            f.write(f"{int(exp(value))}\n")

    with open("z5379852.PART2.output.csv", "w") as f:
        f.write("predicted_rating\n")
        for value in y_pred2:
            f.write(f"{int(value)}\n")


if __name__ == "__main__":
    main()

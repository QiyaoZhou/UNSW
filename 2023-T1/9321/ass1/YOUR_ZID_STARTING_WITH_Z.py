import json
import matplotlib.pyplot as plt
import pandas as pd
import sys
import os
import numpy as np
import math
import re

pd.set_option("display.max.columns",None)

studentid = os.path.basename(sys.modules[__name__].__file__)


def log(question, output_df, other):
    print("--------------- {}----------------".format(question))

    if other is not None:
        print(question, other)
    if output_df is not None:
        df = output_df.head(5).copy(True)
        for c in df.columns:
            df[c] = df[c].apply(lambda a: a[:20] if isinstance(a, str) else a)

        df.columns = [a[:10] + "..." for a in df.columns]
        print(df.to_string())


def question_1(city_pairs):
    """
    :param routes: the path for the routes dataset
    :param suburbs: the path for the routes suburbs
    :return: df1
            Data Type: Dataframe
            Please read the assignment specs to know how to create the output dataframe
    """
    df1 = pd.read_csv(city_pairs)

    df1['passenger_in_out'] = df1.apply(lambda x: "IN" if x["Passengers_In"] > x["Passengers_Out"]
    else ("OUT" if x["Passengers_In"] < x["Passengers_Out"]
          else ("SAME" if x["Passengers_In"] == x["Passengers_Out"]
                else "NONE")), axis=1)

    df1['freight_in_out'] = df1.apply(lambda x: "IN" if x["Freight_In_(tonnes)"] > x["Freight_Out_(tonnes)"]
    else ("OUT" if x["Freight_In_(tonnes)"] < x["Freight_Out_(tonnes)"]
          else ("SAME" if x["Freight_In_(tonnes)"] == x["Freight_Out_(tonnes)"]
                else "NONE")), axis=1)

    df1['mail_in_out'] = df1.apply(lambda x: "IN" if x["Mail_In_(tonnes)"] > x["Mail_Out_(tonnes)"]
    else ("OUT" if x["Mail_In_(tonnes)"] < x["Mail_Out_(tonnes)"]
          else ("SAME" if x["Mail_In_(tonnes)"] == x["Mail_In_(tonnes)"]
                else "NONE")), axis=1)

    log("QUESTION 1", output_df=df1[["AustralianPort", "ForeignPort", "passenger_in_out", "freight_in_out", "mail_in_out"]], other=df1.shape)
    return df1


def question_2(df1):
    """
    :param df1: the dataframe created in question 1
    :return: dataframe df2
            Please read the assignment specs to know how to create the output dataframe
    """
    df2 = pd.DataFrame(sorted(df1['AustralianPort'].unique()), columns=['AustralianPort'])


    df2_1 = df1[df1['passenger_in_out'] == 'IN'].groupby('AustralianPort')['passenger_in_out'].count().reset_index()
    df2_1.rename(columns={'passenger_in_out':'PassengerInCount'},inplace = True)

    df2_2 = df1[df1['passenger_in_out'] == 'OUT'].groupby('AustralianPort')['passenger_in_out'].count().reset_index()
    df2_2.rename(columns={'passenger_in_out': 'PassengerOutCount'}, inplace=True)

    df2_3 = df1[df1['freight_in_out'] == 'IN'].groupby('AustralianPort')['freight_in_out'].count().reset_index()
    df2_3.rename(columns={'freight_in_out': 'FreightInCount'}, inplace=True)

    df2_4 = df1[df1['freight_in_out'] == 'OUT'].groupby('AustralianPort')['freight_in_out'].count().reset_index()
    df2_4.rename(columns={'freight_in_out': 'FreightOutCount'}, inplace=True)

    df2_5 = df1[df1['mail_in_out'] == 'IN'].groupby('AustralianPort')['mail_in_out'].count().reset_index()
    df2_5.rename(columns={'mail_in_out': 'MailInCount'}, inplace=True)

    df2_6 = df1[df1['mail_in_out'] == 'OUT'].groupby('AustralianPort')['mail_in_out'].count().reset_index()
    df2_6.rename(columns={'mail_in_out': 'MailOutCount'}, inplace=True)

    df2 = pd.merge(df2,df2_1, how = 'left', on = 'AustralianPort')
    df2 = pd.merge(df2, df2_2, how='left', on='AustralianPort')
    df2 = pd.merge(df2, df2_3, how='left', on='AustralianPort')
    df2 = pd.merge(df2, df2_4, how='left', on='AustralianPort')
    df2 = pd.merge(df2, df2_5, how='left', on='AustralianPort')
    df2 = pd.merge(df2, df2_6, how='left', on='AustralianPort')

    df2.sort_values("PassengerInCount", ascending=False, inplace=True)


    log("QUESTION 2", output_df=df2, other=df2.shape)
    return df2


def question_3(df1):
    """
    :param df1: the dataframe created in question 1
    :return: df3
            Data Type: Dataframe
            Please read the assignment specs to know how to create the output dataframe
    """
    #################################################
    # Your code goes here ...
    #################################################


    df3 = pd.DataFrame(sorted(df1['Country'].unique()), columns=['Country'])


    df3_1 = df1.groupby('Country')['Passengers_In'].sum().reset_index()
    df3_1.rename(columns={'Passengers_In': 'Passenger_In_Avg'}, inplace=True)

    df3_2 = df1.groupby('Country')['Passengers_Out'].sum().reset_index()
    df3_2.rename(columns={'Passengers_Out': 'Passenger_Out_Avg'}, inplace=True)

    df3_3 = df1.groupby('Country')['Freight_In_(tonnes)'].sum().reset_index()
    df3_3.rename(columns={'Freight_In_(tonnes)': 'Freight_In_Avg'}, inplace=True)

    df3_4 = df1.groupby('Country')['Freight_Out_(tonnes)'].sum().reset_index()
    df3_4.rename(columns={'Freight_Out_(tonnes)': 'Freight_Out_Avg'}, inplace=True)

    df3_5 = df1.groupby('Country')['Mail_In_(tonnes)'].sum().reset_index()
    df3_5.rename(columns={'Mail_In_(tonnes)': 'Mail_In_Avg'}, inplace=True)

    df3_6 = df1.groupby('Country')['Mail_Out_(tonnes)'].sum().reset_index()
    df3_6.rename(columns={'Mail_Out_(tonnes)': 'Mail_Out_Avg'}, inplace=True)

    df3 = pd.merge(df3, df3_1, how='left', on='Country')
    df3 = pd.merge(df3, df3_2, how='left', on='Country')
    df3 = pd.merge(df3, df3_3, how='left', on='Country')
    df3 = pd.merge(df3, df3_4, how='left', on='Country')
    df3 = pd.merge(df3, df3_5, how='left', on='Country')
    df3 = pd.merge(df3, df3_6, how='left', on='Country')


    df3['Passenger_In_Avg'] = df3['Passenger_In_Avg']/456
    df3['Passenger_Out_Avg'] = df3['Passenger_Out_Avg']/456
    df3['Freight_In_Avg'] = df3['Freight_In_Avg']/456
    df3['Freight_Out_Avg'] = df3['Freight_Out_Avg']/456
    df3['Mail_In_Avg'] = df3['Mail_Out_Avg']/456
    df3['Mail_Out_Avg'] = df3['Mail_Out_Avg']/456

    df3.sort_values("Passenger_In_Avg", inplace=True)
    log("QUESTION 3", output_df=df3, other=df3.shape)
    return df3


def question_4(df1):
    """
    :param df1: the dataframe created in question 3
    :return: df4
            Data Type: Dataframe
            Please read the assignment specs to know how to create the output dataframe
    """

    df0 = df1[df1["Passengers_Out"]>0].groupby(["AustralianPort","Country", 'Month']).agg(Count=('ForeignPort','count')).reset_index()
    print(df0)

    df0 = df0[df0['Count'] > 1].groupby('Country').agg(Count=('Count',np.count_nonzero)).reset_index().sort_values(by='Count',ascending=False)

    df0.rename(columns={'Count': 'Unique_ForeignPort_Count'}, inplace=True)
    df4 = df0.iloc[0:5]


    log("QUESTION 4", output_df=df4, other=df4.shape)
    return df4


def question_5(seats):
    """
    :param seats : the path to dataset
    :return: df5
            Data Type: dataframe
            Please read the assignment specs to know how to create the  output dataframe
    """
    df5 = pd.read_csv(seats)

    df5['Source_City'] = df5.apply(lambda x: "International_City" if x["In_Out"] =="I"
    else ("Australian_City"), axis=1)

    df5['Destination_City'] = df5.apply(lambda x: "Australian_City" if x["In_Out"] == "I"
    else ("International_City"), axis=1)



    log("QUESTION 5", output_df=df5, other=df5.shape)
    return df5


def question_6(df5):
    """
    :param df5: the dataframe created in question 5
    :return: df6
    """

    #################################################
    # Your code goes here ...
    #################################################
    table = pd.pivot_table(df5, index=['Year', 'Australian_City', 'International_City'],values=['All_Flights','Max_Seats','Airline'], aggfunc={'Airline':np.count_nonzero,'All_Flights':np.average,'Max_Seats':np.average}, fill_value=0)
    table1 = pd.pivot_table(df5, index=['Year', 'Australian_City', 'International_City'],
                           values=['All_Flights', 'Max_Seats', 'Airline'],
                           aggfunc={'Airline': lambda x: len(x.unique()), 'All_Flights': np.average, 'Max_Seats': np.average},
                           fill_value=0)
    df6 = table.query("(Australian_City == 'Sydney')&(International_City == 'Tokyo')")
    df6_1 = table1.query("(Australian_City == 'Sydney')&(International_City == 'Tokyo')")

    #From the generated results table and df6, we suggest that the number of Airlines from Sydney to Tokyo can be reduced appropriately,
    # and we also suggest that this route should not be selected for new Airline. From the data of df6,
    # we can see that the demand for this route from All_Flights and Max_Seats has been very high since 2003, so since 2003,
    # more and more Airlines have started to join this route, and the values of All_Flights and Max_Seats have not been low,
    # which shows that the demand of the route from Sydney to Tokyo has begun to increase. 2015, from the date of df6_1,
    # we can see that after 2015, the number of Airlines reached 4, indicating that more and more Airlines began to join the competition of this route.
    # However, from the date of df6 in recent years, that is, after 2020,
    # we can see that both the number of Airlines and the number of All_Flights and Max_Seats began to decline year by year,
    # indicating that the demand for this route has begun to decline and this route has been supersaturated.
    # Therefore, we suggest that the route from Sydney to Tokyo can be reduced appropriately.

    log("QUESTION 6", output_df=df6, other=table)
    return df6


def question_7(seats, city_pairs):
    """
    :param seats: the path to dataset
    :param city_pairs : the path to dataset
    :return: nothing, but saves the figure on the disk
    """

    #################################################
    # Your code goes here ...
    #################################################

    plt.savefig("{}-Q7.png".format(studentid))


if __name__ == "__main__":
    df1 = question_1("city_pairs.csv")
    df2 = question_2(df1.copy(True))
    df3 = question_3(df1.copy(True))
    df4 = question_4(df1.copy(True))
    df5 = question_5("seats.csv")
    df6 = question_6(df5.copy(True))
    question_7("seats.csv", "city_pairs.csv")

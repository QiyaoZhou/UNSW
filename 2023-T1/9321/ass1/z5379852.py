import json
import matplotlib.pyplot as plt
import pandas as pd
import sys
import os
import numpy as np
import math
import re

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
    :return: df1
            Data Type: Dataframe
            Please read the assignment specs to know how to create the output dataframe
    """

    #################################################
    # Your code goes here ...
    def check1(stuff_in, stuff_out):
        if stuff_in > stuff_out:
            result = 'IN'
        elif stuff_in < stuff_out:
            result = 'OUT'
        else:
            result = 'SAME'
        return result

    df1 = pd.read_csv(city_pairs)
    df1['passenger_in_out'] = df1.apply(lambda x: check1(x['Passengers_In'], x['Passengers_Out']), axis=1)
    df1['freight_in_out'] = df1.apply(lambda x: check1(x['Freight_In_(tonnes)'], x['Freight_Out_(tonnes)']), axis=1)
    df1['mail_in_out'] = df1.apply(lambda x: check1(x['Mail_In_(tonnes)'], x['Mail_Out_(tonnes)']), axis=1)
    #################################################

    log("QUESTION 1", output_df=df1[["AustralianPort", "ForeignPort", "passenger_in_out", "freight_in_out", "mail_in_out"]], other=df1.shape)
    return df1


def question_2(df1):
    """
    :param df1: the dataframe created in question 1
    :return: dataframe df2
            Please read the assignment specs to know how to create the output dataframe
    """

    #################################################
    # Your code goes here ...
    df2 = pd.DataFrame(sorted(df1['AustralianPort'].unique()), columns=['AustralianPort'])

    process_1 = df1[df1['passenger_in_out'] == 'IN'].groupby('AustralianPort')['passenger_in_out'].count().reset_index()
    process_1.rename(columns={'passenger_in_out': 'PassengerInCount'}, inplace=True)

    process_2 = df1[df1['passenger_in_out'] == 'OUT'].groupby('AustralianPort')['passenger_in_out'].count().reset_index()
    process_2.rename(columns={'passenger_in_out': 'PassengerOutCount'}, inplace=True)

    process_3 = df1[df1['freight_in_out'] == 'IN'].groupby('AustralianPort')['freight_in_out'].count().reset_index()
    process_3.rename(columns={'freight_in_out': 'FreightInCount'}, inplace=True)

    process_4 = df1[df1['freight_in_out'] == 'OUT'].groupby('AustralianPort')['freight_in_out'].count().reset_index()
    process_4.rename(columns={'freight_in_out': 'FreightOutCount'}, inplace=True)

    process_5 = df1[df1['mail_in_out'] == 'IN'].groupby('AustralianPort')['mail_in_out'].count().reset_index()
    process_5.rename(columns={'mail_in_out': 'MailInCount'}, inplace=True)

    process_6 = df1[df1['mail_in_out'] == 'OUT'].groupby('AustralianPort')['mail_in_out'].count().reset_index()
    process_6.rename(columns={'mail_in_out': 'MailOutCount'}, inplace=True)

    df2 = pd.merge(df2, process_1, how='left', on='AustralianPort')
    df2 = pd.merge(df2, process_2, how='left', on='AustralianPort')
    df2 = pd.merge(df2, process_3, how='left', on='AustralianPort')
    df2 = pd.merge(df2, process_4, how='left', on='AustralianPort')
    df2 = pd.merge(df2, process_5, how='left', on='AustralianPort')
    df2 = pd.merge(df2, process_6, how='left', on='AustralianPort')

    df2.sort_values("PassengerInCount", ascending=False, inplace=True)
    #################################################

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
    df3 = df1.groupby(['Country']).agg(
        Passengers_in_average=pd.NamedAgg(column='Passengers_In', aggfunc='mean'),
        Passengers_out_average=pd.NamedAgg(column='Passengers_Out', aggfunc='mean'),
        Freight_in_average=pd.NamedAgg(column='Freight_In_(tonnes)', aggfunc='mean'),
        Freight_out_average=pd.NamedAgg(column='Freight_Out_(tonnes)', aggfunc='mean'),
        Mail_in_average=pd.NamedAgg(column='Mail_In_(tonnes)', aggfunc='mean'),
        Mail_out_average=pd.NamedAgg(column='Mail_Out_(tonnes)', aggfunc='mean'),
    ).sort_values(['Passengers_in_average'], axis=0, ascending=True).reset_index()
    #################################################

    log("QUESTION 3", output_df=df3, other=df3.shape)
    return df3


def question_4(df1):
    """
    :param df1: the dataframe created in question 3
    :return: df4
            Data Type: Dataframe
            Please read the assignment specs to know how to create the output dataframe
    """

    #################################################
    # Your code goes here ...
    process = df1.groupby(['Country', 'Month', "AustralianPort"]).agg(
        Count=pd.NamedAgg(column='ForeignPort', aggfunc='count')
    ).reset_index()
    df4 = process[process['Count'] > 1].groupby(['Country']).agg(
        Unique_ForeignPort_Count=pd.NamedAgg(column='Count', aggfunc='count')
    ).sort_values(['Unique_ForeignPort_Count'], axis=0, ascending=False).reset_index()
    #################################################

    log("QUESTION 4", output_df=df4, other=df4.shape)
    return df4


def question_5(seats):
    """
    :param seats : the path to dataset
    :return: df5
            Data Type: dataframe
            Please read the assignment specs to know how to create the  output dataframe
    """
    #################################################
    # Your code goes here ...
    df5 = pd.read_csv(seats)

    df5['Source_City'] = df5.apply(lambda x: "International_City" if x["In_Out"] == "I" else "Australian_City", axis=1)

    df5['Destination_City'] = df5.apply(lambda x: "Australian_City" if x["In_Out"] == "I" else "International_City", axis=1)
    #################################################

    log("QUESTION 5", output_df=df5, other=df5.shape)
    return df5


def question_6(df5):
    """
    :param df5: the dataframe created in question 5
    :return: df6
    """

    #################################################
    # Your code goes here ...
    cut = df5[['Year', 'Port_Region', 'Airline', 'Max_Seats']]
    df6 = cut.groupby(['Year', 'Port_Region', 'Airline']).agg(
        Max_Seats_Total=pd.NamedAgg(column='Max_Seats', aggfunc='sum')
    ).reset_index()
    df6['Market_share(%)'] = 100*(df6['Max_Seats_Total']/df6.groupby(['Year', 'Port_Region'])['Max_Seats_Total'].transform('sum'))
    df6 = df6.drop(columns=['Max_Seats_Total'])
    # 1
    df6 = df6.round({'Market_share(%)': 2}).sort_values(
        ['Year', 'Port_Region', 'Market_share(%)'], ascending=[True, False, False])
    # 2
    # df6 = df6.round({'Market_share(%)': 2}).sort_values(
    # ['Airline', 'Port_Region', 'Year'], ascending=[True, False, True])
    #################################################
    # Comment:The df6 data box created for this question focuses on adding
    # market share to capture the airline's market and service profile.
    # Market share refers to the total number of seats open on an airline
    # to and from Australia and one region in a unique year as a percentage of
    # the total number of seats open to and from Australia and that region in
    # that unique year. The market share values generated in this way provide
    # a direct indication of the airline's market position in a given year on
    # routes to and from Australia in a unique region, allowing the airline to
    # compare the gap between itself and other airlines in a given region both
    # horizontally and vertically during the year, and to check its market share
    # in a given region over the year.
    #################################################
    #################################################

    log("QUESTION 6", output_df=df6, other=df6.shape)
    return df6


def question_7(seats, city_pairs):
    """
    :param seats: the path to dataset
    :param city_pairs : the path to dataset
    :return: nothing, but saves the figure on the disk
    """

    #################################################
    # Your code goes here ...
    def check3(input, model, num):
        if (input == 'I' and model == 'I') or (input == 'O' and model == 'O'):
            res = num
        else:
            res = 0
        return res
    df_a = pd.read_csv(seats)
    df_b = pd.read_csv(city_pairs)
    df_a = df_a.groupby(['In_Out', 'Australian_City', 'International_City', 'Port_Region', 'Year']).agg(
        Max_Seats_Total=pd.NamedAgg(column='Max_Seats', aggfunc='sum')
    ).reset_index()
    df_a['Max_Seats_In'] = df_a.apply(lambda x: check3(x['In_Out'], 'I', x['Max_Seats_Total']), axis=1)
    df_a['Max_Seats_Out'] = df_a.apply(lambda x: check3(x['In_Out'], 'O', x['Max_Seats_Total']), axis=1)
    df_a = df_a.groupby(['Australian_City', 'International_City', 'Port_Region', 'Year']).agg(
        Max_Seats_In_Total=pd.NamedAgg(column='Max_Seats_In', aggfunc='sum'),
        Max_Seats_Out_Total=pd.NamedAgg(column='Max_Seats_Out', aggfunc='sum')
    ).reset_index()
    df_b = df_b.groupby(['AustralianPort', 'ForeignPort', 'Year']).agg(
        Passengers_In_Total=pd.NamedAgg(column='Passengers_In', aggfunc='sum'),
        Passengers_Out_Total=pd.NamedAgg(column='Passengers_Out', aggfunc='sum')
    ).reset_index()
    res = pd.merge(
        df_a, df_b, left_on=['Australian_City', 'International_City', 'Year'],
        right_on=['AustralianPort', 'ForeignPort', 'Year']
    )
    res = res.groupby(['Australian_City', 'Port_Region', 'Year', ]).agg(
        P_In_Total=pd.NamedAgg(column='Passengers_In_Total', aggfunc='sum'),
        P_Out_Total=pd.NamedAgg(column='Passengers_In_Total', aggfunc='sum'),
        Max_In_Total=pd.NamedAgg(column='Max_Seats_In_Total', aggfunc='sum'),
        Max_Out_Total=pd.NamedAgg(column='Max_Seats_Out_Total', aggfunc='sum')
    ).reset_index()
    res['In(%)'] = 100*res['P_In_Total']/res['Max_In_Total']
    res['Out(%)'] = 100*res['P_Out_Total'] / res['Max_Out_Total']
    res = res.fillna(0).round({'In(%)': 2, 'Out(%)': 2}).sort_values(
        ['Year', 'Australian_City', 'Port_Region'], ascending=True)
    res = res[['Year', 'Australian_City', 'Port_Region', 'In(%)', 'Out(%)']]
    city_name = res['Australian_City'].unique()
    city_num = city_name.shape[0]
    region_name = res['Port_Region'].unique()
    region_num = region_name.shape[0]
    for i in range(city_num):
        plt.subplot(4, 4, i+1)
        for j in range(region_num):
            process = res.query(f'Australian_City == "{city_name[i]}" and Port_Region == "{region_name[j]}"')
            plt.plot(process['Year'], process['In(%)'], label=f"From {region_name[j]}")
            plt.plot(process['Year'], process['Out(%)'], label=f"To {region_name[j]}")
            plt.xticks([2003, 2008, 2013, 2018, 2022], fontsize=5)
            plt.title(f"${city_name[i]}$", fontsize=6, loc='center', color='red')
    plt.legend(loc="lower right", fontsize=5, frameon=False, borderaxespad=0.1)
    #################################################
    # Comment:This visualisation provides a reference for airlines to adjust ticketing
    # and improve profitability by capturing seat utilisation trends over time between
    # 2003 and 2022 on routes between specific Australian cities and the rest of the world.
    # When a trend of less than 100% seat utilisation is observed, airlines should reduce the
    # number of seats on their lines, while when a trend of more than 100% seat utilisation
    # is observed, increasing the number of seats on their lines or selling fewer tickets
    # will maintain good operations to improve profitability.
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

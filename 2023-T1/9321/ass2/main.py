import datetime
import json
import math
import os
import geopandas as gpd
from flask import Flask, request, Response, send_file, make_response
from flask_restx import Resource, Api, fields, reqparse
import requests

import sqlite3
from sqlite3 import Error, Date

from datetime import datetime, timedelta
import time
import matplotlib
import matplotlib.pyplot as plt
from matplotlib.backends.backend_agg import FigureCanvasAgg as FigureCanvas
import pandas as pd
matplotlib.use('Agg')
# matplotlib.use('TkAgg')

import numpy as np

# set up api
basedir = os.path.abspath(os.path.dirname(__file__))
app = Flask(__name__)
api = Api(app, version='1.0', title='z5355526 API', description='Implementation of COMP9321 Assignment 2')
ns = api.namespace('actors', description='Finished Endpoints for Marking')
host_name = "127.0.0.1"
port_num = 5000

last_update_format = "%Y-%m-%d %H:%M:%S"
date_format_lst = [
    "%Y-%m-%d",
    "%d-%m-%Y",
    "%Y/%m/%d",
    "%d/%m/%Y",
]

HTTP_OK = 200
HTTP_CREATED = 201
HTTP_BAD_REQUEST = 400
HTTP_FORBIDDEN = 403
HTTP_NOT_FOUND = 404
HTTP_CONFLICT = 409
HTTP_UNPROCESSABLE_ENTITY = 422

birthday_time_format = "%Y-%m-%d"
''' sql management '''


# create/drop tables

def manage_table(conn, table_sql):
    c = conn.cursor()
    c.execute(table_sql)

    c.close()


# insert/delete record
def manage_record(conn, insert_sql, insert_value):
    c = conn.cursor()
    c.execute(insert_sql, insert_value)
    conn.commit()
    c.close()


# fetch a record
def fetch_one(conn, query_sql, insert_value):
    val = None
    c = conn.cursor()
    c.execute(query_sql, insert_value)
    val = c.fetchone()
    c.close()
    return val


# fetch all record
def fetch_all(conn, query_sql, insert_value):
    val = None

    c = conn.cursor()
    c.execute(query_sql, insert_value)
    val = c.fetchall()
    return val

    c.close()
    return val


resource_fields = api.model("Resource", {
    "name": fields.String,
    "date": fields.String,
    "from_time": fields.String,
    "to_time": fields.String,
    "location": fields.String,
    "description": fields.String, })

Event_rep = reqparse.RequestParser()
Event_rep.add_argument("name", type=str)
Event_rep.add_argument("date", type=str)
Event_rep.add_argument("from_time", type=str)
Event_rep.add_argument("to_time", type=str)
# Event rep.add_argument("street"，type=str)
# Event rep.add argument("suburb"，type=str)
# Event_rep.add argument("post-code"， type=int)
Event_rep.add_argument("location", type=str)
Event_rep.add_argument("description", type=str)

EventList_rep = reqparse.RequestParser()
EventList_rep.add_argument("order", type=str, default=["+id"], action="split")
EventList_rep.add_argument("page", type=int, default=1)
EventList_rep.add_argument("size", type=int, default=10)
EventList_rep.add_argument("filter", type=str, default=["id", "name"], action="split")

EventStatistic_rep = reqparse.RequestParser()
EventStatistic_rep.add_argument("format", choices=['json', 'image'], default='json')

WeatherForecast_rep = reqparse.RequestParser()
WeatherForecast_rep.add_argument("date", type=str)
resource_base_url = "http://127.0.0.1:5000/events"
zId = "z5355526"
Event_table = """
    CREATE TABLE IF NOT EXISTS Event_table (
        id	        INTEGER,
        name	    TEXT,
        date        TEXT,
        from_time	TEXT,
        to_time	    TEXT,
        location	TEXT,
        description  TEXT,
        last_update TEXT,
        PRIMARY KEY("id" AUTOINCREMENT)
    );
    """
conn = sqlite3.connect("{}.db".format(zId))
manage_table(conn, Event_table)


@api.route("/events")
class EventList(Resource):
    @api.expect(EventList_rep)
    def get(self):
        conn = sqlite3.connect("{}.db".format(zId))
        args = EventList_rep.parse_args()
        order = args["order"]
        page = args["page"]
        size = args["size"]
        filter = args["filter"]
        order_list = []
        valid_input = ['id', 'date', 'name', 'from_time', 'to_time', 'location', "description", "last_update"]
        sql = "SELECT COUNT(*) FROM Event_table"
        count = fetch_one(conn, sql, ())[0]
        print(count)
        for item in order:

            if item[0] == "+":
                if item[1:] not in valid_input:
                    print("1order输入格式错误")
                else:
                    order_list.append(item[1:] + ' ' + 'ASC')

            elif item[0] == "-":
                if item[1:] not in valid_input:
                    print("2order输入格式错误")
                else:
                    order_list.append(item[1:] + ' ' + 'DESC')
            else:
                print("3order输入格式错误")
        for item in filter:
            if item not in valid_input:
                print("4order输入格式错误")
        if page < 0 or size < 0:
            print("5order输入格式错误")
        order_by = ','.join(order_list)
        filter_str = ','.join(filter)

        sql = "SELECT " + filter_str + " FROM Event_table ORDER BY " + order_by
        print(sql)
        searchlist = fetch_all(conn, sql, ())
        print(searchlist)
        print(type(size))
        print(type(page))

        if len(searchlist) <= size:
            searchlist = searchlist[0:]
        else:
            upperbound = page * size - 1
            lowerbound = (page - 1) * size
            searchlist = searchlist[lowerbound:upperbound]

        event_result = []
        for row in searchlist:
            temp = {}
            for i in range(len(filter)):
                temp[filter[i]] = row[i]
            event_result.append(temp)

        order_str = ','.join(order)
        self_link = "http://" + request.host + "/actors?order=" + order_str + "&page=" + str(page) + "&size=" + str(
            size) + "&filter=" + filter_str
        next_link = "http://" + request.host + "/actors?order=" + order_str + "&page=" + str(page + 1) + "&size=" + str(
            size) + "&filter=" + filter_str
        pre_link = "http://" + request.host + "/actors?order=" + order_str + "&page=" + str(page - 1) + "&size=" + str(
            size) + "&filter=" + filter_str

        if page == 1:
            if count <= size:
                _links = {
                    "self": {
                        "href": self_link
                    }
                }
            else:
                _links = {
                    "self": {
                        "href": self_link
                    },
                    "next": {
                        "href": next_link
                    }
                }
        else:
            if count <= page * size:
                _links = {
                    "self": {
                        "href": self_link
                    },
                    "previous": {
                        "href": pre_link
                    }
                }
            else:
                _links = {
                    "self": {
                        "href": self_link
                    },
                    "previous": {
                        "href": pre_link
                    },
                    "next": {
                        "href": next_link
                    }
                }
        result = {
            "page": page,
            "page-size": size,
            "events": event_result,
            "_links": _links
        }
        return result, 200

    @api.expect(Event_rep)
    def post(self):
        conn = sqlite3.connect("{}.db".format(zId))
        args = Event_rep.parse_args()
        event_name = args["name"]
        date = args["date"]
        from_time = args["from"]

        to_time = args["to"]
        # street = args["street"]
        # suburb = args["suburb"]
        # post_code = args["post-code"]
        location = args["location"]
        description = args["description"]
        last_update = datetime.now().strftime(last_update_format)

        for curr_format in date_format_lst:
            try:
                val = datetime.strptime(date, curr_format)
                date = val.strftime(date_format_lst[0])
            except:
                print(curr_format)
                continue
            break

        sql = "SELECT from_time,to_time FROM Event_table WHERE date = ?"
        start_end_list = fetch_all(conn, sql, (date,))
        if (start_end_list):
            for item in start_end_list:
                print(datetime.strptime(item[0], '%H:%M') < datetime.strptime(from_time, '%H:%M'))
                if ((datetime.strptime(item[0], '%H:%M') < datetime.strptime(from_time, '%H:%M')) and datetime.strptime(
                        item[1], '%H:%M') > datetime.strptime(from_time, '%H:%M')) or (
                        (datetime.strptime(item[0], '%H:%M') < datetime.strptime(to_time, '%H:%M')) and (
                        datetime.strptime(item[1], '%H:%M') > datetime.strptime(to_time, '%H:%M'))):
                    return {
                               "timestamp": datetime.now().strftime(last_update_format),
                               "error": "	Forbidden",
                               "message": "time overlapping"
                           }, HTTP_FORBIDDEN

        sql = ''' INSERT INTO Event_table(name, date, from_time, to_time, location, description, last_update) VALUES(?,?,?,?,?,?, ?) '''
        manage_record(conn, sql, (event_name, datetime.strptime(date, date_format_lst[0]).strftime(date_format_lst[0]),
                                  datetime.strptime(from_time, '%H:%M').strftime('%H:%M'),
                                  datetime.strptime(to_time, '%H:%M').strftime('%H:%M'), location, description,
                                  last_update))

        sql = ''' SELECT id FROM Event_table WHERE name == ? '''

        id = int(fetch_one(conn, sql, (event_name,))[0])
        return {"id": id,
                "last-update": last_update,
                "_links": {
                    "self": {
                        "href": resource_base_url + "/" + str(id)
                    },
                }
                }, 201


@api.route("/events/<int:event_id>")
class Search_event(Resource):
    def get(self, event_id):
        conn = sqlite3.connect("{}.db".format(zId))

        sql = ''' SELECT * FROM Event_table WHERE id == ? '''

        next_id_command = '''SELECT id FROM Event_table
                                        WHERE date>? OR (date = ? AND from_time>?) ORDER BY date, from_time LIMIT 1'''
        pre_id_command = '''SELECT id FROM Event_table
                                        WHERE date<? OR(date = ? AND from_time <?) 
                                        ORDER BY date DESC, from_time DESC
                                        LIMIT 1'''
        search_list = fetch_one(conn, sql, (event_id,))
        date_time = search_list[2]
        from_time = search_list[3]
        to_time = search_list[4]
        if fetch_one(conn, next_id_command, (date_time, date_time, from_time,)) != None:
            next_id = fetch_one(conn, next_id_command, (date_time, date_time, from_time,))[0]
        else:
            next_id = -1
        if fetch_one(conn, pre_id_command, (date_time, date_time, from_time,)) != None:
            previous_id = fetch_one(conn, pre_id_command, (date_time, date_time, from_time,))[0]
        else:
            previous_id = -1

        if (search_list):
            holiday_list = []
            holiday_url = f"https://date.nager.at/api/v2/publicholidays/2023/AU"
            response = requests.get(holiday_url)
            body = response.json()

            for item in body:
                if item["date"] == date_time:
                    holiday_list.append(item["localName"])
            weather_url = f"https://www.7timer.info/bin/civil.php?lat=-33.865143&lng=151.209900&ac=1&unit=metric&output=json&product=two"
            response2 = requests.get(weather_url)
            body2 = response2.json()
            weather_time = datetime.strptime(body2["init"], '%Y%m%d%H')
            from_time = date_time + " " + from_time
            to_time = date_time + " " + to_time
            from_time = int(datetime.strptime(from_time, '%Y-%m-%d %H:%M').timestamp())
            to_time = int(datetime.strptime(to_time, '%Y-%m-%d %H:%M').timestamp())

            median_time = datetime.fromtimestamp(int((from_time + to_time) / 2)).strftime(last_update_format)
            median_time = datetime.strptime(median_time, last_update_format)
            median_time = median_time - timedelta(hours=11)

            gap_time = int((median_time - weather_time).total_seconds() / 3600)
            gap_time = int(gap_time / 3) * 3
            if datetime.strptime(date_time, '%Y-%m-%d').weekday() in (5, 6):
                weekday = True
            else:
                weekday = False
            if gap_time <= 24 * 7 and gap_time >= 0:
                for item in body2["dataseries"]:
                    if int(item["timepoint"]) == gap_time:
                        wind_speed = str(item["wind10m"]["speed"]) + " KM"
                        weather = str(item["weather"])
                        if weather[-3::] == "day":
                            weather = weather[0:-3]
                        else:
                            weather = weather[0:-5]
                        humidity = str(item["rh2m"])
                        temperature = str(item["temp2m"]) + " C"

                if len(holiday_list) == 0:
                    true_holiday_list = ""
                else:
                    true_holiday_list = ",".join(holiday_list)
                return_json = {"id": event_id, "last-update": search_list[7], "name": search_list[1], "date": date_time,
                               "from": search_list[3], "to": search_list[4], "location": search_list[5],
                               "description": search_list[6], "_metadata": {
                        "wind-speed": wind_speed, "weather": weather, "humidity": humidity, "temperature": temperature,
                        "holiday": true_holiday_list, "weekend": weekday}, "_links": {

                    }}
                return_json["_links"]["self"] = {"href": resource_base_url + "/" + str(event_id)}
                if previous_id > 0:
                    return_json["_links"]["previous"] = {"href": resource_base_url + "/" + str(previous_id)}
                if next_id > 0:
                    return_json["_links"]["next"] = {"href": resource_base_url + "/" + str(next_id)}
            else:
                if len(holiday_list) == 0:
                    true_holiday_list = ""
                else:
                    true_holiday_list = ",".join(holiday_list)
                return_json = {"id": event_id, "last-update": search_list[7], "name": search_list[1],
                               "date": date_time,
                               "from": search_list[3], "to": search_list[4], "location": search_list[5],
                               "description": search_list[6],
                               "_metadata": {"holiday": true_holiday_list, "weekend": weekday}, "_links": {
                    }}
                return_json["_links"]["self"] = {"href": resource_base_url + "/" + str(event_id)}
                if previous_id > 0:
                    return_json["_links"]["previous"] = {"href": resource_base_url + "/" + str(previous_id)}
                if next_id > 0:
                    return_json["_links"]["next"] = {"href": resource_base_url + "/" + str(next_id)}

            return return_json, 200

    def delete(self, event_id):
        conn = sqlite3.connect("{}.db".format(zId))
        sql = ''' SELECT * FROM Event_table WHERE id == ? '''
        search_list = fetch_one(conn, sql, (event_id,))
        print(search_list)
        if search_list != None:
            sql = "DELETE FROM Event_table WHERE id == ?"
            manage_record(conn, sql, (event_id,))
            return_json = {
                "message": "The event with id " + str(event_id) + " was removed from the database!",
                "id": event_id
            }
            return return_json, 200
        else:
            return_json = {
                "message": "we cannot found the message which you want to remove from the database!",
            }
            return return_json, 404

    @api.expect(resource_fields)
    def patch(self, event_id):
        conn = sqlite3.connect("{}.db".format(zId))
        check_exist = '''SELECT * FROM Event_table WHERE id=?'''
        search_list = fetch_one(conn, check_exist, (event_id,))
        update_sql = "UPDATE Event_table SET "

        if search_list != None:
            event_infor = request.json
            print(event_infor)
            for key, value in event_infor.items():
                if value != "string":
                    update_sql += f'{key} = ?,'
            update_sql += "last_update = ?,"
            update_sql = update_sql[0:-1]
            update_sql += ' WHERE id = ?'

            valid_value = tuple(filter(lambda x: x != "string", tuple(event_infor.values())))

            add_tuple = (datetime.now().strftime(last_update_format), str(event_id))
            valid_value = valid_value + add_tuple

            manage_record(conn, update_sql, valid_value)

            return_json = {
                "id": event_id,
                "last-update": datetime.now().strftime(last_update_format),
                "_links": {
                    "self": {
                        "href": resource_base_url + "/" + str(event_id)
                    }
                }
            }
            return return_json, 200


@api.route("/events/statistics")
class EvnetStatisitc(Resource):
    @api.expect(EventStatistic_rep)
    def get(self):
        conn = sqlite3.connect("{}.db".format(zId))
        args = EventStatistic_rep.parse_args()
        cur_day = datetime.now()
        first_day_week = cur_day - timedelta(days=cur_day.weekday())
        first_day_week = first_day_week.date()
        last_day_week = first_day_week + timedelta(days=6)
        first_day_month = cur_day.replace(day=1)
        if cur_day.month == 12:
            last_day_month = cur_day.replace(year=cur_day.year + 1, month=1, day=1) - timedelta(days=1)
        else:
            last_day_month = cur_day.replace(month=cur_day.month + 1, day=1) - timedelta(days=1)

        first_day_month = first_day_month.date()
        last_day_month = last_day_month.date()
        print(cur_day, first_day_week, last_day_week, first_day_month, last_day_month)
        sql1 = "SELECT count(id) FROM Event_table WHERE date>=? AND date <= ?"
        search_list1 = fetch_one(conn, sql1,
                                 (cur_day.strftime(date_format_lst[0]), last_day_week.strftime(date_format_lst[0])))
        search_list2 = fetch_one(conn, sql1, (
        first_day_month.strftime(date_format_lst[0]), last_day_month.strftime(date_format_lst[0])))
        print(search_list1)
        print(search_list2)
        sql2 = "SELECT date,count(id) FROM Event_table GROUP BY date"
        search_list3 = fetch_all(conn, sql2, ())
        print(search_list3)

        sql3 = "SELECT count(id) FROM Event_table"
        search_list4 = fetch_one(conn, sql3, ())
        print(search_list4)
        search_list3_dict = {item[0]: item[1] for item in search_list3}

        infor_format = args["format"]
        return_json = {"total": search_list4[0],
                       "total-current-week": search_list1[0],
                       "total-current-month": search_list2[0],
                       "per-days": search_list3_dict}
        print(return_json)
        if infor_format == "json":
            return return_json, 200
        elif infor_format == "image":
            labels = ['Total', 'Current Week', 'Current Month']
            values = [search_list4[0], search_list1[0], search_list2[0]]
            plt.subplot(1, 2, 1)
            plt.bar(labels, values)
            plt.xlabel('Time Period')
            plt.ylabel('Event Count')
            plt.title('Event Count by Time Period')

            days = list(search_list3_dict.keys())
            counts = list(search_list3_dict.values())

            plt.subplot(1, 2, 2)
            plt.plot(days, counts, marker='o')
            plt.xlabel('Date')
            plt.ylabel('Event Count')
            plt.title('Event Count per Day')



            plt.suptitle('statistic Summary', fontsize=10)
            plt.savefig("statistic.png")
            # plt .tight layout()

            # response = send_file(os.path.join(basedir, "statistic.png"))
            response = send_file("statistic.png", mimetype='image/png')
            return make_response(response, 200)
@api.route("/weather")
class WeatherForecast(Resource):
    @api.expect(WeatherForecast_rep)
    def get(self):
        conn = sqlite3.connect("{}.db".format(zId))
        args = WeatherForecast_rep.parse_args()
        date_infor = args["date"]
        date_infor =datetime.strptime(date_infor, date_format_lst[0])
        date_str = date_infor.strftime(date_format_lst[0])




        fig, ax = plt.subplots(figsize=(8, 6))
        df_city = pd.read_csv("au.csv",usecols=['city',"lat", "lng", "population"])
        top_cities_series = df_city.nlargest(5, "population")["city"]
        top_cities_five = top_cities_series.tolist()
        countries = gpd.read_file(gpd.datasets.get_path("naturalearth_lowres"))
        ax.set_aspect('equal')
        countries[countries["name"] == "Australia"].plot(ax=ax, color="lightgrey")
        df_city.plot(ax=ax, x="lng", y="lat", kind="scatter", c="population", colormap="YlOrRd")


        search_list = []
        for idx, row in df_city.iterrows():
            if row['city']  in top_cities_five:
                lat = row['lat']
                lng = row['lng']
                url = f'https://www.7timer.info/bin/civil.php?lat={lat}&lng={lng}&ac=1&unit=metric&output=json&product=two&date={date_str}'
                response = requests.get(url)
                data = response.json()
                avg_tem = 0
                for i in range(8):
                    avg_tem += data['dataseries'][i]['temp2m']
                avg_tem = int(avg_tem/8)
                weather_infor = data['dataseries'][3]['weather']
                if weather_infor[-3:] =="day":
                    weather_infor = weather_infor[0:-3]
                else:
                    weather_infor = weather_infor[0:-5]
                search_list.append({"city":row['city'],"tem":avg_tem,"weather":weather_infor})
        print(search_list)

        for d in search_list:
            city = d['city']
            tem = d['tem']
            weather = d['weather']
            x, y = df_city.loc[df_city['city'] == city, ['lng', 'lat']].values[0]
            ax.annotate(f'{city}\nTemperature: {tem}\nWeather: {weather}',
                        xy=(x, y), xytext=(-10, 10),
                        textcoords="offset points", ha='center', va='bottom',
                        bbox=dict(boxstyle="round,pad=0.5", fc="white", ec="black", lw=1),fontsize=5)

        ax.grid(True, alpha=0.5)

        plt.savefig("weather_forecast.png")
        # plt .tight layout()

        # response = send_file(os.path.join(basedir, "statistic.png"))
        response = send_file("weather_forecast.png", mimetype='image/png')
        return make_response(response, 200)


        # 将数据以 JSON 格式输出到文件


if __name__ == "__main__":
    with app.app_context():
        app.run(debug=True)

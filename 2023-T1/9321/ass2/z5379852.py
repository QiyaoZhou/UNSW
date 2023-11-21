import sqlite3
import pandas as pd
import requests
from flask import Flask, request, send_file
from flask_restx import Api, Resource
from flask_restx import reqparse
from flask_restx import fields
from datetime import datetime, timedelta
import json
import math
import matplotlib
import matplotlib.pyplot as plt
import geopandas as gpd

matplotlib.use('Agg')

app = Flask(__name__)
api = Api(app, version='1.0', default="calendar", title="REST API MyCalendar",
          description="a time-management and scheduling calendar service for Australians using Flask-Restx.")

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('date')
parser.add_argument('from_time')
parser.add_argument('to_time')
parser.add_argument('location')
parser.add_argument('description')
parser.add_argument('order', action='split', default=['+id'])
parser.add_argument('page', type=int, default=1)
parser.add_argument('size', type=int, default=10)
parser.add_argument('filter', action='split', default=['id', 'name'])
parser.add_argument('format', choices=['json', 'image'], default='json')

host_name = "127.0.0.1"
port_num = 7777
Zid = 'z5379852'
last_update_format = "%Y-%m-%d %H:%M:%S"
date_format_list = [
    "%Y-%m-%d",
    "%d-%m-%Y",
    "%Y/%m/%d",
    "%d/%m/%Y",
]
time_format_list = [
    "%H:%M",
    "%H:%M:%S"
]

# The following is the schema of MyCalendar
location_model = api.model('location', {
    'street': fields.String,
    'suburb': fields.String,
    'state': fields.String,
    'post-code': fields.String
})

# The following is the schema of MyCalendar
mycalendar_model = api.model('MyCalendar', {
    'name': fields.String,
    'date': fields.String,
    'from': fields.String,
    'to': fields.String,
    'location': fields.Nested(location_model),
    'description': fields.String
})


def start_connection(db):
    try:
        c = sqlite3.connect(db)
        return c
    except sqlite3.Error as err:
        print(err)


def start_table(c):
    sql_table = ''' CREATE TABLE IF NOT EXISTS events(
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        last_update TEXT,
                                        name TEXT,
                                        date TEXT,
                                        from_time TEXT,
                                        to_time TEXT,
                                        location TEXT,
                                        description TEXT
                                        ); '''
    try:
        con = c.cursor()
        con.execute(sql_table)
    except sqlite3.Error as e:
        print(e)
    c.close()


def data_retrieve(c, command):
    cur = c.cursor()
    cur.execute(command)
    row = cur.fetchall()
    return row


# Insert the record and will return the id(PK)
def data_insert(c, record):
    command = ''' INSERT INTO events(last_update,name,date,from_time,to_time,location,description)
                VALUES(?,?,?,?,?,?,?)'''
    cur = c.cursor()
    cur.execute(command, record)
    c.commit()
    return cur.lastrowid


def data_delete(c, command):
    cur = c.cursor()
    cur.execute(command)
    c.commit()


def data_update(c, key, value, i):
    command = '''UPDATE events SET {key}='{value}' WHERE id={id}'''.format(key=key, value=value, id=i)
    cur = c.cursor()
    cur.execute(command)
    c.commit()


def location_check(loc):
    state_dict = {
        'Australian Capital Territory': 'ACT',
        'New South Wales': 'NSW',
        'Northern Territory': 'NT',
        'Queensland': 'QLD',
        'South Australia': 'SA',
        'Tasmania': 'TAS',
        'Victoria': 'Vic.',
        'Western Australia': 'WA'}
    for i in state_dict.keys():
        if loc['state'].lower() == i.lower():
            return state_dict[i]
    for j in state_dict.values():
        if loc['state'].lower() == j.lower():
            return j
    if loc['state'].lower() == 'vic':
        return 'Vic.'


#######Q1,Q5#######
@api.route('/events')
class Events(Resource):

    # Q1-----Add a new event
    @api.expect(mycalendar_model)
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(404, 'Not Found')
    @api.doc(description="Add a new event ")
    def post(self):
        conn = start_connection("{}.db".format(Zid))
        event = request.json
        event_name = event['name']
        event_date = event['date']
        from_t = event['from']
        to_t = event['to']
        event_loc = event['location']
        event_desc = event['description']
        date_time = datetime.now().strftime("%Y-%m-%d-%H:%M:%S")
        if location_check(event_loc) is None:
            return {"message": "Date location is invalid"}, 400
        # Convert the input date to a standard format "YYYY-MM-DD"
        check = 0
        for item in date_format_list:
            try:
                process = datetime.strptime(event_date, item)
                event_date = process.strftime(date_format_list[0])
            except ValueError:
                check = check + 1
                continue
            break
        if check == 4:
            return {"message": "Date {} is invalid".format(event_date)}, 400
        check = 0
        for item in time_format_list:
            try:
                process1 = datetime.strptime(from_t, item)
                process2 = datetime.strptime(to_t, item)
                from_t = process1.strftime(time_format_list[0])
                to_t = process2.strftime(time_format_list[0])
            except ValueError:
                check = check + 1
                continue
            break
        if check == 2:
            return {"message": "Date {} or {} is invalid".format(from_t, to_t)}, 400
        if datetime.strptime(from_t, '%H:%M') > datetime.strptime(to_t, '%H:%M'):
            return {"message": "From_time cannot come after to_time"}, 400
        sql = "SELECT from_time,to_time FROM events WHERE date = '{}';".format(event_date)
        same_day = data_retrieve(conn, sql)
        if same_day:
            for item in same_day:
                if ((datetime.strptime(item[0], '%H:%M') <= datetime.strptime(from_t, '%H:%M')) and datetime.strptime(item[1], '%H:%M') > datetime.strptime(from_t, '%H:%M')) \
                        or ((datetime.strptime(item[0], '%H:%M') < datetime.strptime(to_t, '%H:%M')) and (datetime.strptime(item[1], '%H:%M') >= datetime.strptime(to_t, '%H:%M'))) \
                        or ((datetime.strptime(item[0], '%H:%M') >= datetime.strptime(from_t, '%H:%M')) and datetime.strptime(item[1], '%H:%M') <= datetime.strptime(to_t, '%H:%M')):
                    return {
                               "timestamp": datetime.now().strftime(last_update_format),
                               "error": "Forbidden",
                               "message": "Conflicts with existing active time in the database"
                           }, 403
        record = (date_time, event_name, event_date, from_t, to_t, json.dumps(event_loc), event_desc)
        db_id = data_insert(conn, record)  # insert into DB and will return id(PK)
        self_link = "/events/" + str(db_id)
        _links = {"self": {"href": self_link}}
        return {"id": db_id,
                "last-updates": date_time,
                "_links": _links}, 201

    # Q5-----Retrieve the list of available events
    @api.param('order', "Sort the list based on the given attribute(e.g. +id,+name)")
    @api.param('page', "Choose the page that needs to display")
    @api.param('size', "Number of record in one page")
    @api.param('filter', "Choose what attributes that need to display")
    @api.response(200, 'OK')
    @api.response(404, 'No available events')
    @api.response(400, 'Error')
    @api.doc(description='Retrieve the list of available Events')
    def get(self):
        conn = start_connection("{}.db".format(Zid))
        args = parser.parse_args()
        order = args.get('order')
        page = args.get('page')
        size = args.get('size')
        display_attr = args.get('filter')

        if size <= 0:
            return {"message": "Invalid page size"}, 400

        order_attribute = ['id', 'last_update', 'name', 'date', 'from', 'to', 'location', 'description']
        sign_value = ['+', '-']
        order_list = []
        for value in order:
            if value[0] not in sign_value:
                return {"message": "Invalid order sign."}, 400
            if value[1:] not in order_attribute:
                return {"message": "Invalid order attribute"}, 400
            if value[1:] == 'from' or value[1:] == 'to':
                process = value + '_time'
            else:
                process = value
            if process[0] == '+':
                res = process[1:] + ' ' + 'ASC'
            else:
                res = process[1:] + ' ' + 'DESC'
            order_list.append(res)

        filter_attribute = ['id', 'last_update', 'name', 'date', 'from', 'to', 'location', 'description']
        filter_list = []
        for value in display_attr:
            if value not in filter_attribute:
                return {"message": "Invalid filter attribute"}, 400
            if value == 'from' or value == 'to':
                process = value + '_time'
                filter_list.append(process)
            else:
                filter_list.append(value)
        count_row_command = '''SELECT COUNT(*) FROM events'''
        num_row = data_retrieve(conn, count_row_command)[0][0]
        max_page = math.ceil(num_row / size)
        if page > max_page or page <= 0:
            return {"message": "Invalid page number"}, 400
        order_sql = ','.join(order_list)
        filter_sql = ','.join(filter_list)
        command = '''SELECT {} FROM events ORDER BY {}'''.format(filter_sql, order_sql)
        data = data_retrieve(conn, command)
        if len(data) <= (page - 1) * size:
            return {"message": "Invalid page size"}, 400
        elif len(data) < page * size - 1:
            res = data[(page - 1) * size:]
        else:
            res = data[(page - 1) * size:page * size]
        get_res = []
        for item in res:
            process = {}
            for i in range(len(display_attr)):
                process[display_attr[i]] = item[i]
            get_res.append(process)

        order_str = ','.join(order)
        self_link = "/events?order=" + order_str + "&page=" + str(page) + "&size=" + str(size) + "&filter=" + filter_sql
        next_link = "/events?order=" + order_str + "&page=" + str(page + 1) + "&size=" + str(
            size) + "&filter=" + filter_sql
        pre_link = "/events?order=" + order_str + "&page=" + str(page - 1) + "&size=" + str(
            size) + "&filter=" + filter_sql

        if page == 1:
            if num_row <= size:
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
            if num_row <= page * size:
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
        return {
                   "page": page,
                   "size": size,
                   "events": get_res,
                   "_links": _links
               }, 200


##############Q2-Q4#################
@api.route('/events/<int:input_id>')
@api.param('input_id', 'The id of the event')
class Event_operation(Resource):

    # Q2-----Retrieve an event by its id
    @api.response(200, 'OK')
    @api.response(404, 'Event Not Found')
    @api.doc(description="Retrieve the event by its id")
    def get(self, input_id):
        conn = start_connection("{}.db".format(Zid))
        sql = ''' SELECT * FROM events WHERE id = {} '''.format(input_id)

        check = data_retrieve(conn, sql)
        if len(check) == 0:
            return {"message": "The event of id= {} was not found".format(input_id)}, 404
        else:
            data = check[0]
            event_date = data[3]
            from_t = data[4]
            to_t = data[5]
            loc = json.loads(data[6])
            df = pd.read_csv('georef-australia-state-suburb.csv', delimiter=';',
                             usecols=["Geo Point", "Official Name Suburb"])
            suburb_dup = loc['suburb'] + ' (' + location_check(loc) + ')'
            lat = "0"
            lng = "0"
            for idx, row in df.iterrows():
                if row["Official Name Suburb"] == loc['suburb'] or row["Official Name Suburb"] == suburb_dup:
                    coordinate = row["Geo Point"].split(", ")
                    lat = coordinate[0]
                    lng = coordinate[1]
            if lat == lng == "0":
                return {"message": "The location for this event was not found"}, 404
            forward_command = '''SELECT id FROM events
                                                    WHERE date>'{}' OR (date='{}' AND from_time>'{}') 
                                                    ORDER BY date,from_time
                                                    LIMIT 1'''.format(event_date, event_date, from_t)
            backward_command = '''SELECT id FROM events
                                                    WHERE date<'{}' OR (date= '{}' AND from_time<'{}')
                                                    ORDER BY date DESC,from_time DESC
                                                    LIMIT 1'''.format(event_date, event_date, from_t)
            self_link = "/events/" + str(input_id)
            next_id_row = data_retrieve(conn, forward_command)
            pre_id_row = data_retrieve(conn, backward_command)
            if len(next_id_row) != 0:
                next_id = next_id_row[0][0]
                next_link = "/events/" + str(next_id)
            else:
                next_link = "null"
            if len(pre_id_row) != 0:
                pre_id = pre_id_row[0][0]
                pre_link = "/events/" + str(pre_id)
            else:
                pre_link = "null"

            _links = {"self": {"href": self_link},
                      "previous": {"href": pre_link},
                      "next": {"href": next_link}
                      }

            # Check if the day is a holiday
            holiday_res = ""
            holiday_url = f"https://date.nager.at/api/v2/publicholidays/2023/AU"
            response1 = requests.get(holiday_url)
            res1 = response1.json()
            for item in res1:
                if item["date"] == event_date:
                    if holiday_res == "":
                        holiday_res = holiday_res + item["name"]
                    else:
                        holiday_res = holiday_res + ", " + item["name"]

            # Check weather on event (if data exists)
            weather_url = f"https://www.7timer.info/bin/civil.php?lat={lat}&lng={lng}&ac=1&unit=metric&output=json&product=two"
            response2 = requests.get(weather_url)
            res2 = response2.json()
            update_time = datetime.strptime(res2["init"], '%Y%m%d%H')
            start_time = event_date + " " + from_t
            end_time = event_date + " " + to_t
            start_time = int(datetime.strptime(start_time, '%Y-%m-%d %H:%M').timestamp())
            end_time = int(datetime.strptime(end_time, '%Y-%m-%d %H:%M').timestamp())
            event_time = datetime.strptime(
                datetime.fromtimestamp(int((start_time + end_time) / 2)).strftime("%Y-%m-%d %H:%M:%S"),
                "%Y-%m-%d %H:%M:%S") - timedelta(hours=11)

            gap = int((event_time - update_time).total_seconds() / 3600)
            r = gap % 3
            if r <= 1:
                gap = gap - r
            else:
                gap = gap + 3 - r
            # Check if event is weekend
            if datetime.strptime(event_date, '%Y-%m-%d').weekday() in (5, 6):
                weekend = True
            else:
                weekend = False

            if 0 <= gap <= 192:
                wind_speed = ""
                weather = ""
                humidity = ""
                temperature = ""
                for item in res2["dataseries"]:
                    if int(item["timepoint"]) == gap + 3:
                        wind_speed = str(item["wind10m"]["speed"]) + " KM"
                        weather = str(item["weather"])
                        if weather[-3::] == "day":
                            weather = weather[0:-3]
                        else:
                            weather = weather[0:-5]
                        humidity = str(item["rh2m"])
                        temperature = str(item["temp2m"]) + " C"
                return {"id": input_id, "last-update": data[1], "name": data[2], "date": data[3],
                        "from": data[4], "to": data[5], "location": loc, "description": data[7], "_metadata": {
                        "wind-speed": wind_speed, "weather": weather, "humidity": humidity, "temperature": temperature,
                        "holiday": holiday_res, "weekend": weekend}, "_links": _links}, 200
            else:
                return {"id": input_id, "last-update": data[1], "name": data[2], "date": data[3],
                        "from": data[4], "to": data[5], "location": loc, "description": data[7], "_metadata": {
                        "holiday": holiday_res, "weekend": weekend}, "_links": _links}, 200

    # Q3---Delete Event
    @api.response(200, 'OK')
    @api.response(404, 'Event Not Found')
    @api.doc(description="Delete an event by id")
    def delete(self, input_id):
        conn = start_connection("{}.db".format(Zid))
        check_exist = '''SELECT * FROM events
                        WHERE id={};'''.format(input_id)
        data = data_retrieve(conn, check_exist)
        if len(data) == 0:
            return {"message": "The event of id={} was not found.".format(input_id)}, 404
        else:
            delete_command = '''DELETE FROM events
                                WHERE id={};'''.format(input_id)
            data_delete(conn, delete_command)
            return {"message": "The event with id {} was removed from the database!".format(input_id),
                    "id": input_id}, 200

    # Q4----Update an Event
    @api.response(200, 'OK')
    @api.response(404, 'Event Not Found')
    @api.doc(description="Update an event by id")
    @api.expect(mycalendar_model)
    def patch(self, input_id):
        conn = start_connection("{}.db".format(Zid))
        check_exist = '''SELECT * FROM events
                                WHERE id={};'''.format(input_id)
        data = data_retrieve(conn, check_exist)
        if len(data) == 0:
            return {"message": "The event of id={} was not found.".format(input_id)}, 404
        else:
            event = request.json
            if 'location' in event:
                event_loc = event['location']
                if location_check(event_loc) is None:
                    return {"message": "Date location is invalid"}, 400
            if 'date' in event:
                event_date = event['date']
                # Convert the input date to a standard format "YYYY-MM-DD"
                check = 0
                for item in date_format_list:
                    try:
                        process = datetime.strptime(event_date, item)
                        event_date = process.strftime(date_format_list[0])
                    except ValueError:
                        check = check + 1
                        continue
                    break
                if check == 4:
                    return {"message": "Date {} is invalid".format(event_date)}, 400
            else:
                event_date = data[3]
            if 'from' in event or 'to' in event:
                if 'from' in event and 'to' not in event:
                    from_t = event['from']
                    to_t = data[5]
                elif 'to' in event and 'from' not in event:
                    from_t = data[4]
                    to_t = event['to']
                else:
                    from_t = event['from']
                    to_t = event['to']
                check = 0
                for item in time_format_list:
                    try:
                        process = datetime.strptime(from_t, item)
                        from_t = process.strftime(time_format_list[0])
                    except ValueError:
                        check = check + 1
                        continue
                    break
                if check == 2:
                    return {"message": "Date {} is invalid".format(from_t)}, 400
                check = 0
                for item in time_format_list:
                    try:
                        process = datetime.strptime(to_t, item)
                        to_t = process.strftime(time_format_list[0])
                    except ValueError:
                        check = check + 1
                        continue
                    break
                if check == 2:
                    return {"message": "Date {} is invalid".format(to_t)}, 400
                if datetime.strptime(from_t, '%H:%M') > datetime.strptime(to_t, '%H:%M'):
                    return {"message": "From_time cannot come after to_time"}, 400
                sql = "SELECT from_time,to_time FROM events WHERE date = '{}';".format(event_date)
                same_day = data_retrieve(conn, sql)
                if same_day:
                    for item in same_day:
                        if ((datetime.strptime(item[0], '%H:%M') <= datetime.strptime(from_t, '%H:%M')) and datetime.strptime(item[1], '%H:%M') > datetime.strptime(from_t, '%H:%M')) \
                                or ((datetime.strptime(item[0], '%H:%M') < datetime.strptime(to_t, '%H:%M')) and (datetime.strptime(item[1], '%H:%M') >= datetime.strptime(to_t, '%H:%M'))) \
                                or ((datetime.strptime(item[0], '%H:%M') >= datetime.strptime(from_t, '%H:%M')) and datetime.strptime(item[1], '%H:%M') <= datetime.strptime(to_t, '%H:%M')):
                            return {
                                       "timestamp": datetime.now().strftime(last_update_format),
                                       "error": "Forbidden",
                                       "message": "Conflicts with existing active time in the database"
                                   }, 403

            new_last_update = datetime.now().strftime("%Y-%m-%d-%H:%M:%S")
            for key in event:
                if key not in mycalendar_model.keys():
                    return {"message": "Property {} is invalid".format(key)}, 400
            for key in event:
                if key == 'date':
                    data_update(conn, key, datetime.strptime(event[key], "%Y-%m-%d").strftime("%Y-%m-%d"), input_id)
                elif key == 'from':
                    data_update(conn, 'from_time', event[key], input_id)
                elif key == 'to':
                    data_update(conn, 'to_time', event[key], input_id)
                else:
                    data_update(conn, key, event[key], input_id)
            data_update(conn, "last_update", new_last_update, input_id)

            return {"id": input_id,
                    "last-update": new_last_update,
                    "_links": {"self": {"href": "/events/" + str(input_id)}}}, 200


##############Q6###############
@api.route('/events/statistics')
@api.param('format', 'Choose the format to show the statistics.(json/image)')
class Events_statistics(Resource):
    @api.response(200, 'OK')
    @api.response(404, 'No available events')
    @api.response(400, 'Error')
    @api.doc(description="Get the stats of attributes of the events in a chosen format")
    def get(self):
        conn = start_connection("{}.db".format(Zid))
        args = parser.parse_args()
        format_res = args.get('format')
        sql = '''SELECT date FROM events;'''
        date_summary = data_retrieve(conn, sql)
        now_time = datetime.now()
        total = 0
        total_week = 0
        total_month = 0
        count_per_day = {}
        for item in date_summary:
            total = total + 1
            item_date = datetime.strptime(item[0], '%Y-%m-%d')
            if now_time.isocalendar()[1] == item_date.isocalendar()[1]:
                total_week = total_week + 1
            if now_time.month == item_date.month:
                total_month = total_month + 1
            if item[0] in count_per_day:
                count_per_day[item[0]] += 1
            else:
                count_per_day[item[0]] = 1
        if format_res == 'json':
            return {
                       "total": str(total),
                       "total-current-week": str(total_week),
                       "total-current-month": str(total_month),
                       "per-days": count_per_day
                   }, 200
        elif format_res == 'image':
            x = ['total', 'same-week', 'same-month']
            y = [total, total_week, total_month]
            for key, value in count_per_day.items():
                x.append(key)
                y.append(value)
            plt.bar(x, y, color='red', width=0.5, align='center')
            plt.xticks(fontsize=6)
            plt.savefig('res.png')
            return send_file('res.png', mimetype='image/png')


##############Q7###############
@api.route("/weather")
@api.param('date', 'Show the weather forecast for the day')
class Events_statistics(Resource):
    @api.response(200, 'OK')
    @api.response(404, 'No available events')
    @api.response(400, 'Error')
    @api.doc(description="Show the weather forecast for the day")
    def get(self):
        # conn = start_connection("{}.db".format(Zid))
        args = parser.parse_args()
        get_date = args.get('date')
        check = 0
        for item in date_format_list:
            try:
                process = datetime.strptime(get_date, item)
                get_date = process.strftime(date_format_list[0])
            except ValueError:
                check = check + 1
                continue
            break
        if check == 4:
            return {"message": "Date {} is invalid".format(get_date)}, 400
        now_time = datetime.strptime(datetime.now().strftime("%Y-%m-%d"), "%Y-%m-%d")
        get_time = datetime.strptime(get_date, "%Y-%m-%d")
        if (get_time - now_time) > timedelta(days=7):
            return {"message": "Date {} is not within the range of the weather forecast".format(get_date)}, 404
        else:
            diff = (get_time - now_time).days
        csv_file = "au.csv"
        df = pd.read_csv(csv_file)
        columns_to_drop = ['country',
                           'iso2',
                           'admin_name',
                           'capital',
                           'population',
                           'population_proper'
                           ]
        df.drop(columns_to_drop, inplace=True, axis=1)
        data_city = df.head(5)
        city_list = []
        tem_list = []
        weather_list = []
        for idx, row in data_city.iterrows():
            lat = row['lat']
            lng = row['lng']
            url = f'https://www.7timer.info/bin/civil.php?lat={lat}&lng={lng}&ac=1&unit=metric&output=json&product=two'
            response = requests.get(url)
            data_weather = response.json()
            avg_tem = 0
            for i in range(8):
                avg_tem += data_weather['dataseries'][7 * diff + i]['temp2m']
            avg_tem = int(avg_tem / 8)
            weather_info = data_weather['dataseries'][7 * diff + 3]['weather']
            if weather_info[-3:] == "day":
                weather_info = weather_info[0:-3]
            else:
                weather_info = weather_info[0:-5]
            city_list.append(row['city'])
            tem_list.append(avg_tem)
            weather_list.append(weather_info)

        fig, ax = plt.subplots(figsize=(8, 6))
        countries = gpd.read_file(gpd.datasets.get_path("naturalearth_lowres"))
        ax.set_aspect('equal')
        countries[countries["name"] == "Australia"].plot(ax=ax, color="green")
        data_city.plot(ax=ax, x="lng", y="lat", kind="scatter")
        for i in range(5):
            x, y = data_city.loc[data_city['city'] == city_list[i], ['lng', 'lat']].values[0]
            ax.annotate(f'{city_list[i]}\n{tem_list[i]}C {weather_list[i]}', xy=(x, y),
                        xytext=(x + 0.1, y + 0.1),
                        arrowprops=dict(facecolor='black', shrink=0.05))
        plt.savefig('weather_forecast.png')
        return send_file('weather_forecast.png', mimetype='image/png')


if __name__ == "__main__":
    conn = start_connection("{}.db".format(Zid))
    if conn is not None:
        start_table(conn)
    else:
        print("Error. Connection cannot create")
    app.run(host=host_name, port=port_num, debug=True)

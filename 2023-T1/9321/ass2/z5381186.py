import sqlite3
import requests
import re
from flask import Flask,request,send_file,send_from_directory
from flask_restx import Api,Resource
from flask_restx import reqparse
from flask_restx import fields
from datetime import datetime, timedelta
import json
import math
import matplotlib
import matplotlib.pyplot as plt


app = Flask(__name__)
api = Api(app,default = "actors", title="actors database", description= "API for actors in TV Maze")

parser = reqparse.RequestParser()
parser.add_argument('name')
parser.add_argument('order',action = 'split', default=['+id'])
parser.add_argument('page',type = int, default=1)
parser.add_argument('size',type = int, default=10)
parser.add_argument('filter',action='split', default=['id','name'])
parser.add_argument('format',choices=['json','image'],default='json')
parser.add_argument('by', action='split',default= ['country','gender'])


# The following is the schema of Actor
actor_model = api.model('Actor',{
    'name': fields.String,
    'country': fields.String,
    'birthday': fields.String,
    'deathday': fields.String,
    'gender': fields.String,
    'shows': fields.String
})

#######Q1#######
@api.route('/actors/import')
@api.param('name','Name of the actor')
class Actors(Resource):
    @api.response(200, 'OK')
    @api.response(400, 'Bad Request')
    @api.response(404, 'Not Found')
    @api.doc(description="Import Actors")
    def post(self):
        conn = create_connection(r"z5381186.db")
        args = parser.parse_args()
        people_name = args.get('name')
        people_name = re.sub("[^A-Za-z]"," ",people_name)                                           #replace all non-English characters with space

        print(people_name)
        search_url = 'https://api.tvmaze.com/search/people?q=' + people_name
        data_raw = requests.get(search_url).json()

        if len(data_raw) == 0:
            return {"message": "Person {} is not found".format(people_name)},404
        else:
            people_info = data_raw[0]                                                               #take the first match
            #check whether there is an duplicate in DB
            check_duplicates = '''SELECT * FROM actors
                        WHERE tvmaze_id={};'''.format(people_info['person']['id'])
            data = data_retrieve(conn, check_duplicates)
            if len(data) == 0:                                                                        #did not find duplicates
                cur_time = datetime.now()
                date_time = cur_time.strftime("%Y-%m-%d-%H:%M:%S")                                  #format like "2021-04-08-12:34:40"
                tvmaze_id = people_info['person']['id']                                              #Actor id in TVmaze. Use it to find the show
                actor_name = people_info['person']['name']                                           #actor's name
                if people_info['person']['country'] is not None:
                    country = people_info['person']['country']['name']                                  #country
                else:
                    country = None
                birthday = people_info['person']['birthday']                                        #birthday
                deathday = people_info['person']['deathday']                                        #deathday
                gender = people_info['person']['gender']                                            #gender

                show_url = "https://api.tvmaze.com/people/" + str(tvmaze_id) + "/castcredits?embed=show"
                show_raw = requests.get(show_url).json()
                show_name=[]
                for i in range(len(show_raw)):
                    show_name.append(show_raw[i]['_embedded']['show']['name'])
                show_name_str = ';'.join(show_name)
                record = (date_time,actor_name,country,birthday,deathday,gender,show_name_str,tvmaze_id)
                db_id = data_insert(conn,record)                                                            #insert into DB and will return id(PK)

                self_link = "http://" + request.host + "/actors/" + str(db_id)
                _links={"self":{"href": self_link}}
                result = {"id":db_id,
                          "last-updates": date_time,
                          "_links": _links}
                return result,201
            else:                                                                                           #found duplicate in DB
                return {"message": "Actor {} is already in DB".format(people_name)},400

        return {"message": "Unknown Error"}, 400

##############Q2-Q4#################
@api.route('/actors/<int:id>')
@api.param('id','The id of the actor')
class Actor_operation(Resource):

    #Q2-----Retrieve an Actor
    @api.response(200, 'OK')
    @api.response(404, 'Actor Not Found')
    @api.doc(description="Retrieve the actor by his/her id")
    def get(self,id):
        conn = create_connection(r"z5381186.db")
        #check whether the actor is in DB
        check_exist = '''SELECT * FROM actors
                        WHERE id={};'''.format(id)
        data = data_retrieve(conn, check_exist)
        if len(data) ==0:
            return {"message": "The actor of id= {} was not found".format(id)},404
        else:
            #if exist, extract the data
            record = data[0]
            last_updates = record[1]
            actor_name = record[2]
            country = record[3]
            birthday = record[4]
            deathday = record[5]
            shows = record[6]

            #get the previous and next id
            next_id_command = '''SELECT id FROM actors
                                WHERE id>{} LIMIT 1;'''.format(id)
            pre_id_command = '''SELECT id FROM actors
                                WHERE id<{} 
                                ORDER BY id DESC
                                LIMIT 1;'''.format(id)
            #form _links
            self_link = "http://" + request.host + "/actors/" + str(id)
            next_id_row = data_retrieve(conn, next_id_command)
            pre_id_row = data_retrieve(conn, pre_id_command)
            if len(next_id_row) !=0:
                next_id = next_id_row[0][0]
                next_link = "http://" + request.host + "/actors/" + str(next_id)
            else:
                next_link = "null"                                                      #if not exist, then it is null
            if len(pre_id_row) !=0:
                pre_id = pre_id_row[0][0]
                pre_link = "http://" + request.host + "/actors/" + str(pre_id)
            else:
                pre_link = "null"

            _links = {"self":{"href": self_link},
                        "previous":{"href": pre_link},
                        "next":{"href": next_link}
                      }
            result = {"id": id,
                      "last-updates": last_updates,
                      "name": actor_name,
                      "country": country,
                      "birthday": birthday,
                      "deathday": deathday,
                      "shows": shows,
                      "_links": _links}
            return result,200

    #Q3---Delete Actor
    @api.response(200, 'OK')
    @api.response(404, 'Actor Not Found')
    @api.doc(description="Delete an actor by his/her id")
    def delete(self,id):
        conn = create_connection(r"z5381186.db")
        #check whether the actor is in DB
        check_exist = '''SELECT * FROM actors
                        WHERE id={};'''.format(id)
        data = data_retrieve(conn, check_exist)
        if len(data) ==0:
            return {"message": "The actor of id={} was not found".format(id)},404
        else:
            # doing delete operation
            delete_command = '''DELETE FROM actors
                                WHERE id={};'''.format(id)
            data_delete(conn,delete_command)
            return {"message": "The actor with id={} was deleted".format(id),
                     "id": id},200

    #Q4----Update an Actor
    @api.response(200, 'OK')
    @api.response(404, 'Actor Not Found')
    @api.doc(description="Update an actor by his/her id")
    @api.expect(actor_model)
    def patch(self,id):
        conn = create_connection(r"z5381186.db")
        #check whether the actor is in DB
        check_exist = '''SELECT * FROM actors
                        WHERE id={};'''.format(id)
        data = data_retrieve(conn, check_exist)
        if len(data) ==0:
            return {"message": "The actor of id= {} was not found".format(id)},404
        else:
            record = data[0]

            # get the payload and convert it to a JSON
            actor = request.json

            #get the newest update time
            now = datetime.now()
            new_last_update = now.strftime("%Y-%m-%d-%H:%M:%S")

            #id cannot be changed
            if 'id' in actor:
                return {"message": "id cannot be changed"},400
            if 'name' in actor and record[2] !=actor['name']:
                return {"message": "Name cannot be changed"}, 400
            for key in actor:
                if key not in actor_model.keys():
                    return {"message": "Property {} is invalid".format(key)},400
                print(key,actor[key],id)
                data_update(conn,key,actor[key],id)
                # update_command = f'UPDATE actors SET {key}={actor[key]} WHERE id={id}'

            #return result
            self_link = "http://" + request.host + "/actors/" + str(id)
            _links = {"self": {"href": self_link}}
            result = {"id": id,
                      "last-update": new_last_update,
                      "_links": _links}
            return result,200

##############Q5###########
@api.route('/actors')
@api.param('order',"Sort the list based on the given attribute(e.g. +id,+name)")
@api.param('page',"Choose the page that needs to display")
@api.param('size',"Number of record in one page")
@api.param('filter',"Choose what attributes that need to display")
class Retrieve_avaliable_actors(Resource):
    @api.response(200, 'OK')
    @api.response(404, 'No avaliable actors')
    @api.response(400, 'Error')
    @api.doc(description='Retrieve the list of available Actors')
    def get(self):
        conn = create_connection(r'z5381186.db')

        args = parser.parse_args()
        order = args.get('order')
        page = args.get('page')
        size = args.get('size')
        filter = args.get('filter')

        if size <= 0:
            return {"message": "Invalid page size"},400

        #check validation of order
        order_attribute=['id','last_updates','name','country','birthday','deathday']
        sign_value=['+','-']
        for value in order:
            if value[0] not in sign_value:
                return {"message": "Invalid order sign."},400
            if value[1:] not in order_attribute:
                return {"message": "Invalid order attribute"},400

        #check validation of filter
        filter_attribute = ['id','last_updates','name','country','birthday','deathday',"shows"]
        for value in filter:
            if value not in filter_attribute:
                return {"message": "Invalid filter attribute"},400

        #check validation of page & size
        if size<=0:
            return {"message": "Invalid size"},400
        count_row_command = '''SELECT COUNT(*) FROM actors'''
        num_row = data_retrieve(conn,count_row_command)[0][0]
        max_page = math.ceil(num_row/size)
        if page >max_page:
            return {"message": "Invalid page number"},400

        order_by=[]
        for value in order:
            sign = value[0]
            attribute = value[1:]
            if sign == '+':
                temp = attribute + ' '+ 'ASC'
            else:
                temp = attribute + ' ' + 'DESC'
            order_by.append(temp)

        order_by = ','.join(order_by)
        filter_str = ','.join(filter)
        command = '''SELECT {filter} FROM actors ORDER BY {order_by}'''.format(filter=filter_str,order_by=order_by)
        data = data_retrieve(conn,command)
        if len(data)<= size:
            data = data[0:]
        else:
            upperbound = page*size-1
            lowerbound = (page-1)*size
            data = data[lowerbound:upperbound]

        actors_result=[]
        for row in data:
            temp = {}
            for i in range(len(filter)):
                temp[filter[i]] = row[i]
            actors_result.append(temp)

        order_str = ','.join(order)
        self_link = "http://"+request.host+"/actors?order="+ order_str +"&page="+str(page)+"&size="+str(size)+"&filter="+filter_str
        next_link = "http://"+request.host+"/actors?order="+ order_str +"&page="+str(page+1)+"&size="+str(size)+"&filter="+filter_str
        pre_link = "http://"+request.host+"/actors?order="+ order_str +"&page="+str(page-1)+"&size="+str(size)+"&filter="+filter_str

        if page ==1:
            if num_row<= size:
                _links = {
                    "self": {
                        "href": self_link
                    }
                }
            else:
                _links= {
                    "self": {
                        "href":self_link
                    },
                    "next":{
                        "href":next_link
                    }
                }
        else:
            if num_row<= page*size:
                _links= {
                    "self": {
                        "href":self_link
                    },
                    "previous":{
                        "href":pre_link
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
            "size": size,
            "actors": actors_result,
            "_links": _links
        }
        return result,200

##############Q6###############
@api.route('/actors/statistics')
@api.param('format','Choose the format to show the statistics.(json/image)')
@api.param('by','Choose to see statistics of which attributes.(country/birthday/gender/lifestatus')
class Actors_stats(Resource):
    @api.response(200, 'OK')
    @api.response(404, 'No avaliable actors')
    @api.response(400, 'Error')
    @api.doc(description="Get the stats of attributes of the actors in a chosen format")
    def get(self):
        conn = create_connection(r"z5381186.db")

        args = parser.parse_args()
        format=args.get('format')
        by = args.get('by')
        #check validation of by
        for value in by:
            if value not in ['country','birthday','gender','lifestatus']:
                return {"message": "Invalid parameter by"},400

        check_exist = '''SELECT * FROM actors'''
        data = data_retrieve(conn,check_exist)
        if len(data) ==0:
            return {"message": "The actor of id= {} was not found".format(id)},404
        else:
            total = len(data)
            count_updates=0
            alive=0
            passed=0
            male = 0
            female = 0
            for row in data:
                #Count the total number of actors updated in the last 24 hours
                last_updates = row[1]
                now = datetime.now()
                old_time = now - timedelta(hours=24)
                old_time = old_time.strftime("%Y-%m-%d-%H:%M:%S")
                now_time = now.strftime("%Y-%m-%d-%H:%M:%S")
                if last_updates >=old_time or last_updates<=now_time:
                    count_updates +=1

                #Count the number of actors that are alive
                birthday = row[4]
                deathday = row[5]
                if birthday is not None and deathday is None:
                    alive += 1
                elif deathday is not None:
                    passed +=1

                #Count the number of each gender
                gender = row[6]
                if gender == 'Male':
                    male += 1
                elif gender == 'Female':
                    female +=1

            alive_ratio={}
            life_status={}
            alive_ratio['alive']='{:.2f}%'.format(alive/total)
            alive_ratio['passed'] = '{:.2f}%'.format(passed/total)
            alive_ratio['Unknown']= '{:.2f}%'.format((total-alive-passed)/total)
            life_status['alive'] = alive
            life_status['passed'] = passed
            life_status['Unknown']= total-alive-passed

            gender_ratio={}
            gender_quan={}
            gender_ratio['male']='{:.2f}%'.format(male/total)
            gender_ratio['female'] = '{:.2f}%'.format(female/total)
            gender_ratio['Unknown'] = '{:.2f}%'.format((total-male-female)/total)
            gender_quan['male'] = male
            gender_quan['female']=female
            gender_quan['Unknown'] = total-male-female

        #Count the percentage of each country
        country_command = '''SELECT COUNT(*),country FROM actors GROUP BY country'''
        data_country = data_retrieve(conn, country_command)
        by_country={}
        country_quan={}
        for row in data_country:
            country = row[1]
            country_nmb = row[0]
            country_ratio = '{:.2f}%'.format(country_nmb/total)
            if country is None:
                by_country['Unknown'] = country_ratio
                country_quan['Unknown'] = country_nmb
            else:
                by_country[country]=country_ratio
                country_quan[country]=country_nmb

        #Count the percentage of each year of birthday
        birthday_command = '''SELECT COUNT(*),birthday FROM actors GROUP BY strftime('%Y',birthday)'''
        data_birthday = data_retrieve(conn,birthday_command)
        by_birth_year={}
        birthyear_quan={}
        for row in data_birthday:
            birthday = row[1]
            count_year = row[0]
            year = birthday.split('-')
            year_ratio = '{:.2f}%'.format(count_year/total)
            if year[0] is None:
                by_birth_year['Unknown']=year_ratio
                birthyear_quan['Unknown']=count_year
            else:
                by_birth_year[year[0]] = year_ratio
                birthyear_quan[year[0]]=count_year

        if format == 'json':
            result={"total": total, "total-updated": count_updates}
            for value in by:
                temp = 'by' + '-' + value
                if value == 'country':
                    result[temp]= by_country
                elif value == 'gender':
                    result[temp]= gender_ratio
                elif value == 'birthday':
                    result[temp]= by_birth_year
                elif value =='lifestatus':
                    result[temp]= alive_ratio
            return result,200
        else:
            #format == image
            matplotlib.use('agg')
            fig = plt.figure(figsize=(15,15),dpi=100)
            for value in by:
                if value == 'country':
                    ax1=fig.add_subplot(221)
                    ax1.pie(country_quan.values(),labels=country_quan.keys(),autopct="%1.2f%%")
                    ax1.legend(loc='upper left',title="Ratio of country")
                    # filename='country.png'
                    # plt.savefig(filename)
                    # plt.clf()
                    # send_file(filename, mimetype='image/png', cache_timeout=0)
                    # return(send_file(filename,mimetype='image/png',cache_timeout=0))
                elif value == 'gender':
                    ax2 = fig.add_subplot(222)
                    ax2.pie(gender_quan.values(),labels=gender_quan.keys(),autopct="%1.2f%%")
                    ax2.legend(loc='upper left',title="Ratio of gender")
                    # filename='gender.png'
                    # plt.savefig(filename)
                    # plt.clf()
                    # send_file(filename, mimetype='image/png', cache_timeout=0)
                    # return(send_file(filename,mimetype='image/png',cache_timeout=0))
                elif value == 'birthday':
                    ax3 = fig.add_subplot(223)
                    ax3.pie(birthyear_quan.values(),labels=birthyear_quan.keys(),autopct="%1.2f%%")
                    ax3.legend(loc='upper left',title="Ratio of the year of birthday")
                    # filename='birthday.png'
                    # plt.savefig(filename)
                    # plt.clf()
                    # send_file(filename, mimetype='image/png', cache_timeout=0)
                    # return(send_file(filename,mimetype='image/png',cache_timeout=0))
                elif value =='lifestatus':
                    ax4= fig.add_subplot(224)
                    ax4.pie(life_status.values(),labels=life_status.keys(),autopct="%1.2f%%")
                    ax4.legend(loc='upper left',title="Ratio of life status")
                    # filename='life_status.png'
                    # plt.savefig(filename)
                    # plt.clf()
                    # send_file(filename, mimetype='image/png', cache_timeout=0)
                    # return(send_file(filename,mimetype='image/png',cache_timeout=0))
            file_name = 'result.png'
            plt.savefig(file_name)
            return send_file(file_name,mimetype='image/png',cache_timeout=0)



def create_connection(db):
    conn = None
    try:
        conn = sqlite3.connect(db)
        return conn
    except sqlite3.Error as err:
        print(err)

def create_table(conn):
    sql_actors_table = ''' CREATE TABLE IF NOT EXISTS actors(
                                        id INTEGER PRIMARY KEY AUTOINCREMENT,
                                        last_update TEXT,
                                        name TEXT,
                                        country TEXT,
                                        birthday TEXT,
                                        deathday TEXT,
                                        gender TEXT,
                                        shows TEXT,
                                        tvmaze_id INTEGER
                                        ); '''
    try:
        con = conn.cursor()
        con.execute(sql_actors_table)
    except sqlite3.Error as e:
        print(e)

def data_retrieve(conn, command):
    cur = conn.cursor()
    cur.execute(command)
    row = cur.fetchall()
    return row

#Insert the record and will return the id(PK)
def data_insert(conn,record):
    command = ''' INSERT INTO actors(last_update,name,country,birthday,deathday,gender,shows,tvmaze_id)
                VALUES(?,?,?,?,?,?,?,?)'''
    cur = conn.cursor()
    cur.execute(command,record)
    conn.commit()

    return cur.lastrowid

def data_delete(conn,command):
    cur = conn.cursor()
    cur.execute(command)
    conn.commit()

def data_update(conn,key,value,id):
    command = '''UPDATE actors SET {key}='{value}' WHERE id={id}'''.format(key=key,value=value,id=id)
    cur = conn.cursor()
    cur.execute(command)
    conn.commit()

if __name__ == "__main__":
    conn = create_connection(r"z5381186.db")
    if conn is not None:
        create_table(conn)
    else:
        print("Error. Connection cannot create")
    app.run(host='127.0.0.1', port=8888, debug=True)
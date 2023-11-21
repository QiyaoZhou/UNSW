from datetime import datetime, timedelta

a = '2023-11-7'
print(datetime.strptime(a, "%Y-%m-%d"))
print(datetime.strptime(a, "%Y-%m-%d").strftime("%Y-%m-%d"))

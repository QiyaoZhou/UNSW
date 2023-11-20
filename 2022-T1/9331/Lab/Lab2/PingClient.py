
#PYTHON VERSION 3

import socket
import datetime


host = '127.0.0.1'
port = int(input('port:'))
ping = []
client = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
address = (host,port)
x = 3331
for i in range(15):
    t1 = datetime.datetime.now()
    msg = 'PING'+ str(x) + str(t1) + '\r' + '\n'
    x = x + 1
    client.sendto(msg.encode(),address)
    client.settimeout(0.6)

    try:
        a = client.recv(1024).decode()
        t2 = datetime.datetime.now()
        ping.append(int((t2 - t1).total_seconds() * 1000 ))
        print("PING to ",host," seq = ",int(x-1)," rtt = ",int((t2 - t1).total_seconds() * 1000 )," ms")
    
    except socket.timeout:
        t2 = datetime.datetime.now()
        print("PING to ",host," seq = ",int(x-1)," time out")

print("\nMax rtt = ",max(ping),"ms Min rtt = ",min(ping),"ms Avg rtt = ",sum(ping)/len(ping),"ms")
client.close()

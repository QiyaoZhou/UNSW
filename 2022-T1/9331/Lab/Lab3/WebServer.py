
#PYTHON VERSION 3

import socket
import sys
import os

host = '127.0.0.1'
port = int(input('port:'))
server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
server.bind((host,port))
server.listen()
print("The server is available now.")

while True:
    cSocket, address = server.accept()
    print("Connection Success.")
    r = cSocket.recv(1024).decode().split('/n')
    request = r[0].replace('/','').split(' ')
    if request[0] == 'GET':
        filename = request[1]
        folder = [a for a in os.listdir(os.curdir)]

        if filename in folder and filename[-5:] == '.html':
            with open(filename) as f:
                a = f.read()
                cSocket.send('\nHTTP/1.1 200 OK\n\n'.encode())
                cSocket.sendall(a.encode())

        elif filename in folder and filename[-4:] == '.png':
            cSocket.send('\nHTTP/1.1 200 OK\n\n'.encode())
            image = open(filename,'rb')
            data = image.read()
            cSocket.sendall(data)
        else:
            print('No Such File.')
            cSocket.send('\nHTTP/1.1 404 Not Found\n\n'.encode())
    
    cSocket.close()



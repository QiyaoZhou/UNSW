"""
    Python 3
    Usage: python3 TCPClient3.py SERVER_PORT
    coding: utf-8
    
    Author: Qiyao Zhou
"""
import socket
import sys

serverHost = '127.0.0.1'
serverPort = int(sys.argv[1])
serverAddress = (serverHost, serverPort)
clientHost = '127.0.0.1'

clientsocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)

while True:
    username = input('Enter username:')
    msg_send = 'LOGIN_USERNAME ' + str(username)
    clientsocket.sendto(msg_send.encode(), serverAddress)
    clientsocket.settimeout(0.5)
    try:
        msg_receive = clientsocket.recv(1024).decode()
    except socket.timeout:
        clientsocket.sendto(msg_send.encode(), serverAddress)
        msg_receive = clientsocket.recv(1024).decode()
    check = 0
    if msg_receive == 'SUCCESS':
        password = input('Enter password:')
        msg_send = 'LOGIN_PASSWORD ' + str(username) + ' ' + str(password)
        clientsocket.sendto(msg_send.encode(), serverAddress)
        clientsocket.settimeout(0.5)
        try:
            msg_receive = clientsocket.recv(1024).decode()
        except socket.timeout:
            clientsocket.sendto(msg_send.encode(), serverAddress)
            msg_receive = clientsocket.recv(1024).decode()
        if msg_receive == 'CORRECT':
            print('Welcome to the forum\n')
            while True:
                command = input('Enter one of the following commands: CRT,'
                                ' MSG, DLT, EDT, LST, RDT, UPD, DWN, RMV, XIT:')
                msg_send = 'COMMAND ' + str(username) + ' ' + str(command)
                clientsocket.sendto(msg_send.encode(), serverAddress)
                clientsocket.settimeout(0.5)
                try:
                    msg_receive = clientsocket.recv(1024).decode()
                except socket.timeout:
                    clientsocket.sendto(msg_send.encode(), serverAddress)
                    msg_receive = clientsocket.recv(1024).decode()
                if msg_receive == 'CRT_SUCCESS':
                    print(f'Thread {command[4:]} created')
                elif msg_receive == 'CRT_OCCUPY':
                    print(f'Thread {command[4:]} exists')
                elif msg_receive == 'RMV_SUCCESS':
                    print(f'Thread {command[4:]} removed')
                elif msg_receive == 'RMV_NONE_EXIST':
                    print(f'Thread {command[4:]} does not exist')
                elif msg_receive == 'RMV_NONE_POWER':
                    print(f'Thread {command[4:]} cannot be removed')
                elif msg_receive.split(' ')[0] == 'LST_SUCCESS':
                    print('The list of active threads:')
                    for a in msg_receive[11:].split(' '):
                        print(f'{a}')
                elif msg_receive == 'LST_EMPTY':
                    print('No threads to list')
                elif msg_receive == 'MSG_SUCCESS':
                    c = command.split(' ')[1]
                    print(f'Message posted to {c} thread')
                elif msg_receive == 'MSG_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'DLT_SUCCESS':
                    print('The message has been deleted')
                elif msg_receive == 'DLT_NONE_POWER':
                    print('The message belongs to another '
                          'user and cannot be edited')
                elif msg_receive == 'DLT_NONE_EXIST':
                    print('The message does not exist')
                elif msg_receive == 'DLT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'EDT_SUCCESS':
                    print('The message has been edited')
                elif msg_receive == 'EDT_NONE_POWER':
                    print('The message belongs to another '
                          'user and cannot be edited')
                elif msg_receive == 'EDT_NONE_EXIST':
                    print('The message does not exist')
                elif msg_receive == 'EDT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'RDT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'RDT_BEGIN':
                    while True:
                        thread_massage_receive = clientsocket.recv(1024).decode()
                        if thread_massage_receive == 'RDT_SUCCESS':
                            break
                        else:
                            print(f'{thread_massage_receive}')
                elif msg_receive == 'UPD_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'UPD_OCCUPY':
                    c = command.split(' ')[2]
                    print(f'File {c} does not exist')
                elif msg_receive.split(' ')[0] == 'UPD_PERMIT':
                    title = msg_receive.split(' ')[1]
                    filename = msg_receive.split(' ')[2]
                    check_msg = clientsocket.recv(1024).decode()
                    if check_msg == 'CONNECT_OK':
                        TCP_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        TCP_client.connect(serverAddress)
                        with open(filename) as f:
                            a = f.read()
                            TCP_client.sendall(a.encode())
                        TCP_client.close()
                        massage_receive = clientsocket.recv(1024).decode()
                        if massage_receive == 'UPD_OK':
                            print(f'{filename} uploaded to {title} thread')
                elif msg_receive == 'DNW_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'DNW_FILENAME_NON_EXIST':
                    c = command.split(' ')[2]
                    print(f'File {c} does not exist')
                elif msg_receive.split(' ')[0] == 'DNW_PERMIT':
                    filename = msg_receive.split(' ')[1]
                    check_msg = clientsocket.recv(1024).decode()
                    if check_msg == 'CONNECT_OK':
                        TCP_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        TCP_client.connect(serverAddress)
                        fp = open(filename, 'wb')
                        filedata = bytes()
                        server_tcp, address = TCP_client.accept()
                        while True:
                            r = server_tcp.recv(1024)
                            filedata = filedata + r
                            if len(r) < 1024:
                                break
                        fp.write(filedata)
                        fp.close()
                        TCP_client.close()
                    massage_receive = clientsocket.recv(1024).decode()
                    if massage_receive == 'DNW_OK':
                        print(f'{filename} successfully downloaded')
                elif msg_receive == 'INCORRECT_SYNTAX':
                    c = command.split(' ')[0]
                    print(f'Incorrect syntax for {c}')
                elif msg_receive == 'GOODBYE':
                    print('Goodbye')
                    break
                elif msg_receive == 'INVALID_COMMAND':
                    print('Invalid command')
        elif msg_receive == 'INCORRECT':
            print('Invalid password\n')
    elif msg_receive == 'NEW':
        password = input('New user,enter password:')
        msg_send = 'NEW_PASSWORD ' + str(username) + ' ' + str(password)
        clientsocket.sendto(msg_send.encode(), serverAddress)
        clientsocket.settimeout(0.5)
        try:
            msg_receive = clientsocket.recv(1024).decode()
        except socket.timeout:
            clientsocket.sendto(msg_send.encode(), serverAddress)
            msg_receive = clientsocket.recv(1024).decode()
        if msg_receive == 'REGISTER_SUCCESS':
            while True:
                command = input('Enter one of the following commands: CRT,'
                                ' MSG, DLT, EDT, LST, RDT, UPD, DWN, RMV, XIT:')
                msg_send = 'COMMAND ' + str(username) + ' ' + str(command)
                clientsocket.sendto(msg_send.encode(), serverAddress)
                clientsocket.settimeout(0.5)
                try:
                    msg_receive = clientsocket.recv(1024).decode()
                except socket.timeout:
                    clientsocket.sendto(msg_send.encode(), serverAddress)
                    msg_receive = clientsocket.recv(1024).decode()
                if msg_receive == 'CRT_SUCCESS':
                    print(f'Thread {command[4:]} created')
                elif msg_receive == 'CRT_OCCUPY':
                    print(f'Thread {command[4:]} exists')
                elif msg_receive == 'RMV_SUCCESS':
                    print(f'Thread {command[4:]} removed')
                elif msg_receive == 'RMV_NONE_EXIST':
                    print(f'Thread {command[4:]} does not exist')
                elif msg_receive == 'RMV_NONE_POWER':
                    print(f'Thread {command[4:]} cannot be removed')
                elif msg_receive.split(' ')[0] == 'LST_SUCCESS':
                    print('The list of active threads:')
                    for a in msg_receive[11:].split(' '):
                        print(f'{a}')
                elif msg_receive == 'LST_EMPTY':
                    print('No threads to list')
                elif msg_receive == 'MSG_SUCCESS':
                    c = command.split(' ')[1]
                    print(f'Message posted to {c} thread')
                elif msg_receive == 'MSG_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'DLT_SUCCESS':
                    print('The message has been deleted')
                elif msg_receive == 'DLT_NONE_POWER':
                    print('The message belongs to another '
                          'user and cannot be edited')
                elif msg_receive == 'DLT_NONE_EXIST':
                    print('The message does not exist')
                elif msg_receive == 'DLT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'EDT_SUCCESS':
                    print('The message has been edited')
                elif msg_receive == 'EDT_NONE_POWER':
                    print('The message belongs to another '
                          'user and cannot be edited')
                elif msg_receive == 'EDT_NONE_EXIST':
                    print('The message does not exist')
                elif msg_receive == 'EDT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'RDT_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'RDT_BEGIN':
                    while True:
                        thread_massage_receive = clientsocket.recv(1024).decode()
                        if thread_massage_receive == 'RDT_SUCCESS':
                            break
                        else:
                            print(f'{thread_massage_receive}')
                elif msg_receive == 'UPD_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'UPD_OCCUPY':
                    c = command.split(' ')[2]
                    print(f'File {c} does not exist')
                elif msg_receive.split(' ')[0] == 'UPD_PERMIT':
                    title = msg_receive.split(' ')[1]
                    filename = msg_receive.split(' ')[2]
                    check_msg = clientsocket.recv(1024).decode()
                    if check_msg == 'CONNECT_OK':
                        TCP_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        TCP_client.connect(serverAddress)
                        with open(filename) as f:
                            a = f.read()
                            TCP_client.sendall(a.encode())
                        TCP_client.close()
                        massage_receive = clientsocket.recv(1024).decode()
                        if massage_receive == 'UPD_OK':
                            print(f'{filename} uploaded to {title} thread')
                elif msg_receive == 'DNW_THREAD_NONE_EXIST':
                    c = command.split(' ')[1]
                    print(f'Thread {c} does not exist')
                elif msg_receive == 'DNW_FILENAME_NONE_EXIST':
                    c = command.split(' ')[2]
                    print(f'File {c} does not exist')
                elif msg_receive.split(' ')[0] == 'DNW_PERMIT':
                    filename = msg_receive.split(' ')[1]
                    check_msg = clientsocket.recv(1024).decode()
                    if check_msg == 'CONNECT_OK':
                        TCP_client = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                        TCP_client.connect(serverAddress)
                        fp = open(filename, 'wb')
                        file_data = bytes()
                        while True:
                            r = TCP_client.recv(1024)
                            file_data = file_data + r
                            if len(r) < 1024:
                                break
                        fp.write(file_data)
                        fp.close()
                        TCP_client.close()
                    massage_receive = clientsocket.recv(1024).decode()
                    if massage_receive == 'DNW_OK':
                        print(f'{filename} successfully downloaded')
                elif msg_receive == 'INCORRECT_SYNTAX':
                    c = command.split(' ')[0]
                    print(f'Incorrect syntax for {c}')
                elif msg_receive == 'GOODBYE':
                    print('Goodbye')
                    break
                elif msg_receive == 'INVALID_COMMAND':
                    print('Invalid command')
        elif msg_receive == 'INCORRECT':
            print('Invalid password\n')
    elif msg_receive == 'OCCUPY':
        print(f'{username} has already logged in')
    if check == 1:
        break

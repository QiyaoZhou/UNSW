"""
    Python 3
    Usage: python3 TCPClient3.py SERVER_PORT
    coding: utf-8
    
    Author: Qiyao Zhou
"""

import socket
import sys
import threading
import os

serverHost = '127.0.0.1'
serverPort = int(sys.argv[1])
serverAddress = (serverHost, serverPort)

user_dict = {}
f = open('credentials.txt')
for line in f.readlines():
    user_name = line.split(' ')[0]
    user_password = line.split(' ')[1].strip()
    user_dict[user_name] = user_password
f.close()

user_login = []
Thread_list = []
forum = []


def client_manage(s, addr, msg):
    global user_dict
    global user_login
    global Thread_list
    global forum

    file = open('credentials.txt', 'a')
    if msg.split(' ')[0] == 'LOGIN_USERNAME':
        print('Client authenticating\n')
        username = msg.split(' ')[1]
        if username in user_dict.keys() and username not in user_login:
            s.sendto('SUCCESS'.encode(), addr)
        elif username in user_dict.keys() and username in user_login:
            s.sendto('OCCUPY'.encode(), addr)
            print(f'{username} has already logged in\n')
        elif username not in user_dict:
            s.sendto('NEW'.encode(), addr)
    elif msg.split(' ')[0] == 'LOGIN_PASSWORD':
        username = msg.split(' ')[1]
        password = msg.split(' ')[2]
        if password == user_dict[username]:
            s.sendto('CORRECT'.encode(), addr)
            user_login.append(username)
            print(f'{username} successful login')
        else:
            s.sendto('INCORRECT'.encode(), addr)
            print('Incorrect password\n')
    elif msg.split(' ')[0] == 'NEW_PASSWORD':
        username = msg.split(' ')[1]
        password = msg.split(' ')[2]
        user_dict[username] = password
        print('new user\n')
        file.write(f'\n{username} {password}')
        file.close()
        user_login.append(username)
        s.sendto('REGISTER_SUCCESS'.encode(), addr)
        print(f'{username} successful login')
    elif msg.split(' ')[0] == 'COMMAND':
        username = msg.split(' ')[1]
        command = msg.split(' ')[2:]
        if command[0] == 'LST' and len(command) == 1:
            print(f'{username} issued LST command')
            if len(Thread_list) != 0:
                msg_send = 'LST_SUCCESS ' + ' '.join(Thread_list)
                s.sendto(msg_send.encode(), addr)
            else:
                s.sendto('LST_EMPTY'.encode(), addr)
        elif command[0] == 'CRT' and len(command) == 2:
            print(f'{username} issued CRT command')
            if command[1] not in Thread_list:
                Thread_list.append(command[1])
                s.sendto('CRT_SUCCESS'.encode(), addr)
                forum.append([username])
                print(f'Thread {command[1]} created')
            else:
                s.sendto('CRT_OCCUPY'.encode(), addr)
                print(f'Thread {command[1]} exists')
        elif command[0] == 'RMV' and len(command) == 2:
            print(f'{username} issued RMV command')
            if command[1] in Thread_list:
                if username == forum[Thread_list.index(command[1])][0]:
                    forum.remove(forum[Thread_list.index(command[1])])
                    Thread_list.remove(command[1])
                    s.sendto('RMV_SUCCESS'.encode(), addr)
                    for a in os.listdir(os.curdir):
                        if a.split('-')[0] == command[1]:
                            os.remove(a)
                    print(f'Thread {command[1]} removed')
                else:
                    s.sendto('RMV_NONE_POWER'.encode(), addr)
                    print(f'Thread {command[1]} cannot be removed')
            else:
                s.sendto('RMV_NONE_EXIST'.encode(), addr)
                print(f'Thread {command[1]} cannot be removed')
        elif command[0] == 'MSG' and len(command) > 2:
            print(f'{username} issued MSG command')
            title = command[1]
            if title in Thread_list:
                thread_msg = username + ': ' + ' '.join(command[2:])
                forum[Thread_list.index(title)].append(thread_msg)
                s.sendto('MSG_SUCCESS'.encode(), addr)
                print(f'Message posted to {title} thread')
            else:
                s.sendto('MSG_THREAD_NONE_EXIST'.encode(), addr)
        elif command[0] == 'DLT' and len(command) == 3:
            title = command[1]
            msg_num = command[2]
            if title not in Thread_list:
                s.sendto('DLT_THREAD_NONE_EXIST'.encode(), addr)
            else:
                count = 0
                k = 0
                for i in range(1, len(forum[Thread_list.index(title)])):
                    if ':' in forum[Thread_list.index(title)][i]:
                        count = count + 1
                    if count == int(msg_num) and username == forum[Thread_list.index(title)][i].split(':')[0]:
                        k = i
                    elif count == int(msg_num) and username != forum[Thread_list.index(title)][i].split(':')[0]:
                        s.sendto('DLT_NONE_POWER'.encode(), addr)
                        print('Message cannot be deleted')
                if k != 0:
                    del forum[Thread_list.index(title)][k]
                    s.sendto('DLT_SUCCESS'.encode(), addr)
                    print('Message has been deleted')
                if count < int(msg_num):
                    s.sendto('DLT_NONE_EXIST'.encode(), addr)
        elif command[0] == 'EDT' and len(command) > 2:
            title = command[1]
            msg_num = command[2]
            edt_msg = username + ': ' + ' '.join(command[3:])
            if title not in Thread_list:
                s.sendto('EDT_THREAD_NONE_EXIST'.encode(), addr)
            else:
                count = 0
                for i in range(1, len(forum[Thread_list.index(title)])):
                    if ':' in forum[Thread_list.index(title)][i]:
                        count = count + 1
                    if count == int(msg_num) and username == forum[Thread_list.index(title)][i].split(':')[0]:
                        forum[Thread_list.index(title)][i] = edt_msg
                        s.sendto('EDT_SUCCESS'.encode(), addr)
                        print('Message has been edited')
                    elif count == int(msg_num) and username != forum[Thread_list.index(title)][i].split(':')[0]:
                        s.sendto('EDT_NONE_POWER'.encode(), addr)
                        print('Message cannot be edited')
                if count < int(msg_num):
                    s.sendto('EDT_NONE_EXIST'.encode(), addr)
        elif command[0] == 'RDT' and len(command) == 2:
            title = command[1]
            if title not in Thread_list:
                s.sendto('RDT_THREAD_NONE_EXIST'.encode(), addr)
                print('Incorrect thread specified')
            else:
                s.sendto('RDT_BEGIN'.encode(), addr)
                if len(forum[Thread_list.index(title)]) == 1:
                    msg_send = 'Thread ' + title + ' is empty'
                    s.sendto(msg_send.encode(), addr)
                else:
                    count = 0
                    for i in range(1, len(forum[Thread_list.index(title)])):
                        if ':' in forum[Thread_list.index(title)][i]:
                            count = count + 1
                            msg_send = str(count) + ' ' + forum[Thread_list.index(title)][i]
                        else:
                            msg_send = forum[Thread_list.index(title)][i]
                        s.sendto(msg_send.encode(), addr)
                s.sendto('RDT_SUCCESS'.encode(), addr)
                print(f'Thread {title} read')
        elif command[0] == 'UPD' and len(command) == 3:
            title = command[1]
            filename = command[2]
            if title not in Thread_list:
                s.sendto('UPD_THREAD_NONE_EXIST'.encode(), addr)
                print(f'{title} does not exist')
            else:
                check = 0
                for i in forum[Thread_list.index(title)]:
                    if ':' not in i and filename in i:
                        check = 1
                if check == 1:
                    s.sendto('UPD_OCCUPY'.encode(), addr)
                    print(f'{filename} exists')
                else:
                    msg_send = 'UPD_PERMIT ' + title + ' ' + filename
                    s.sendto(msg_send.encode(), addr)
                    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    server.bind(serverAddress)
                    server.listen()
                    s.sendto('CONNECT_OK'.encode(), addr)
                    fn = title + '-' + filename
                    fp = open(fn, 'wb')
                    file_data = bytes()
                    server_tcp, address = server.accept()
                    while True:
                        r = server_tcp.recv(1024)
                        file_data = file_data + r
                        if len(r) < 1024:
                            break
                    fp.write(file_data)
                    fp.close()
                    server.close()
                    upload_msg = username + ' uploaded ' + filename
                    forum[Thread_list.index(title)].append(upload_msg)
                    s.sendto('UPD_OK'.encode(), addr)
                    print(f'{username} uploaded file {filename} to {title} thread')
        elif command[0] == 'DNW' and len(command) == 3:
            title = command[1]
            filename = command[2]
            if title not in Thread_list:
                s.sendto('DNW_THREAD_NONE_EXIST'.encode(), addr)
                print(f'{title} does not exist')
            else:
                check = 0
                for i in forum[Thread_list.index(title)]:
                    if ':' not in i and filename in i:
                        check = 1
                if check == 0:
                    s.sendto('DNW_FILENAME_NONE_EXIST'.encode(), addr)
                    print(f'{filename} does not exist in thread {title}')
                else:
                    msg_send = 'DNW_PERMIT ' + filename
                    s.sendto(msg_send.encode(), addr)
                    server = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
                    server.bind(serverAddress)
                    server.listen()
                    s.sendto('CONNECT_OK'.encode(), addr)
                    while True:
                        server_tcp, address = server.accept()
                        fn = title + '-' + filename
                        with open(fn) as file:
                            a = file.read()
                            server_tcp.sendall(a.encode())
                        server_tcp.close()
                        if a != b'':
                            break
                    server.close()
                    s.sendto('DNW_OK'.encode(), addr)
                    print(f'{filename} downloaded from Thread {title}')
        elif command[0] == 'XIT' and len(command) == 1:
            user_login.remove(username)
            print(f'{username} exited')
            s.sendto('GOODBYE'.encode(), addr)
            if len(user_login) == 0:
                print('Waiting for clients')
        elif command[0] not in ['CRT', 'LST', 'RMV', 'MSG', 'DLT',
                                'EDT', 'RDT', 'UPD', 'DNM', 'XIT']:
            s.sendto('INVALID_COMMAND'.encode(), addr)
        else:
            s.sendto('INCORRECT_SYNTAX'.encode(), addr)


def main():
    serversocket = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
    serversocket.bind(serverAddress)
    print('Waiting for clients')

    while True:
        data, addr = serversocket.recvfrom(1024)
        msg = data.decode('utf-8')
        threading.Thread(target=client_manage, args=(serversocket, addr, msg)).start()


if __name__ == '__main__':
    main()

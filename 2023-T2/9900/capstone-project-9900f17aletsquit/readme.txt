The project was run and tested on a Lubuntu 20.4.1 LTS virtual machine as
Project requirements.
The following are all the commands required to run the project. 
You need to run the first ten steps of commands when you use them for the first time. 
If you want to use them later, you only need to start from the ninth step and ignore the tenth step.
1.Update apt
	(1)sudo apt-get update
2.Install curl
	(1)sudo snap install curl # version 8.1.2
3.Install nodejs
	(1)curl -fsSL https://deb.nodesource.com/setup_16.x | sudo -E bash -
	(2)sudo apt-get install -y nodejs
4.Install java 11
	(1)sudo apt-get install openjdk-11-jdk
5. Install Redis server
	(1) sudo apt-get install redis-server
6.Install MySQL
	(1)sudo apt install mysql-server
7.Install npm
	(1)sudo apt install npm
8.Install the react and MUI package necessary for the frontend
	(1)Go to “./frontend” folder
	(2)npm install react react-dom
	(3)npm install react react-router-dom
	(4)npm install @mui/material @emotion/react @emotion/styled
9.Start Redis server and MySQL server
	(1)sudo systemctl start redis-server
	(2)sudo systemctl start mysql
10.Set up database
	(1)CREATE DATABASE car_space_renting_database;
	(2)CREATE USER 'letsquit'@'localhost' IDENTIFIED BY '9900letsquit';
	(3)GRANT ALL PRIVILEGES ON car_space_renting_database.* TO 'letsquit'@'localhost';
	(4)FLUSH PRIVILEGES;
	(5)exit;
11.Import sql file
	(1)Navigate to the root
	(2)sudo mysql -u root
	(3)USE car_space_renting_database;
	(4)source car_space_renting_database.sql;
	(5)exit;
12.Start the backend
	(1)Navigate to the root
	(2)java -jar back_end.jar
13.Start the frontend
	(1)Navigate to the“./frontend” folder
	(2)npm start
14.Open firefox and go to http://localhost:3000, then you can enjoy this project.
	
	

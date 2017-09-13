# Project Title

Node based CRUD TodoApp with JWT authentication and tests.


## Prerequisites

To use this repo, you need to have node.js and mongoDB installed.



## Installing dependencies and running MongoDB

### Install project dependencies
Go to a folder where project code is downloaded and install project's dependencies:

```
\node-mongo-todo-with-supertest> npm install
```

### Run MongoDB server
dbpath - path specified during MongoDB installation (where all databases are physically stored on a hard drive)

```
C:\Program Files\MongoDB\Server\3.4\bin>mongod.exe --dbpath c:\mongodb\dbs
```

## Run

### Running the app
TodoApp database is created automatically on first use. Start the app:

- Version with Promises:

```
\node-mongo-todo-with-supertest> npm start
```
- Version with Async Await instead of Promises:

```
\node-mongo-todo-with-supertest> npm start-aa
```

### Test using Postman
- Install chrome addon: [Postman](https://chrome.google.com/webstore/detail/postman/fhbjgbiflinjbdggehcddcbncdddomop)

- Open Postman and import provided MongoDB - TodoApp.postman_collection.json file.


## Running CRUD tests
TodoAppTest database is created automatically on first use.

- with Promises:
```
\node-mongo-todo-with-supertest> npm run test-watch
```
- with Async Await:
```
\node-mongo-todo-with-supertest> npm run test-watch-aa
```


## Steps to deploy the app on heroku

### 1. mLab.com - MongoDB as a service
    - create new database and name it 'todoapp'
    - create user to connect to this DB
    - copy connection string from the screen  and
      changing <user> and <password> to created user credentials 
      i.e. mongodb://username:password@ds123456.mlab.com:21494/todoapp

### 2. command line 
    - \node-mongo-todo-with-supertest> heroku create
    - \node-mongo-todo-with-supertest> git push heroku master

### 3. heroku.com 
    - log in to heroku, click on app name (created in 2. step)
    - go to 'Settings' tab
    - under 'Config Variables' create variable:
      KEY: MONGODB_URI
      VALUE: mongodb://username:password@ds123456.mlab.com:21494/todoapp


## External resources
- [jwt.io](https://jwt.io/)
- [http statuses](https://httpstatuses.com/)
# Project Title

Node based CRUD TodoApp with Node, Express, MongoDB, Mongoose. CRUD tests applied.

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

## Running the app
TodoApp database is created automatically on first use.

```
\node-mongo-todo-with-supertest> npm start
```

## Running CRUD tests
TodoAppTest database is created automatically on first use.

```
\node-mongo-todo-with-supertest> npm run test-watch
```

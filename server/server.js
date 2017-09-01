var express = require('express');
var bodyParser = require('body-parser');

var {mongoose} = require('./db/mongoose');
var {Todo} = require('../models/todo');
var {User} = require('../models/user');


var app = express();
// bodyParser - takes JSON and convert to JS object
// return value from .json() is a function (middleware)
app.use(bodyParser.json());
// -------------------

app.post('/todos', (req, res)=>{
    // .body - stored by bodyParser
    console.log(req.body);

    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (error)=>{
        res.status(400).send(error);
    } )
});

// -------------------
app.listen(process.env.PORT || 3000, ()=>{
    console.log('Server started')
});
require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');


var app = express();
// body-parser - takes JSON and and stores it as a JS object accessible through req.body
// body-parser extract the entire body portion of an incoming request stream and exposes it on req.body .
// body-parser was a part of Express.js earlier but now you have to install it separately
app.use(bodyParser.json());
// from config.js
const port = process.env.PORT;


// -- add new item -----------------

app.post('/todos', (req, res)=>{
    var todo = new Todo({
        text: req.body.text
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (error)=>{
        res.status(400).send(error);
    } )
});


// -- GET all items -----------------

app.get('/todos', (req, res)=>{
    Todo.find().then((todos)=>{
        res.send({todos});
    }, (err)=>{
        res.status(400).send(err);
    })
})


// -- GET one item -----------------

app.get('/todos/:id', (req, res)=>{
    // get id from route params
    var id = req.params.id;

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    Todo.findById(id).then((todo)=>{
        // validate if not null
        if(!todo){
            return res.status(404).send();
        }

        // valid and todo found
        res.send({todo}); // put into object for more flexibility
    }, (err)=>{
        res.status(400).send(err);
    });
});


// -- DELETE one item -----------------

app.delete('/todos/:id', (req, res)=>{
    // get id from route params
    var id = req.params.id;

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    // return removed object after removal
    Todo.findByIdAndRemove(id).then((todo)=>{
        // validate if not null
        if(!todo){
            return res.status(404).send();
        }

        // valid and todo found
        res.send({todo}); // put into object for more flexibility
    }, (err)=>{
        res.status(400).send(err);
    }).catch((error)=>{
        res.status(400).send();
    });
})


// -- UPDATE an item -----------------

app.patch('/todos/:id', (req, res)=>{
    // get id from route params
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // return removed object after removal
    Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo)=>{
        // validate if not null
        if(!todo){
            return res.status(404).send();
        }

        res.send({todo}); 
    }).catch((error)=>{
        res.status(400).send();
    });
})


// -------------------
app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
});

module.exports = {
    app
}
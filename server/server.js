require('./config/config');

const express = require('express');
const bodyParser = require('body-parser');
const {ObjectID} = require('mongodb');
const _ = require('lodash');

const {mongoose} = require('./db/mongoose');
const {Todo} = require('./models/todo');
const {User} = require('./models/user');
// middleware
const {authenticate} = require('./middleware/authenticate');


var app = express();
// body-parser - takes JSON and and stores it as a JS object accessible through req.body
// body-parser - extract the entire body portion of an incoming request stream and exposes it on req.body .
// body-parser - was a part of Express.js earlier but now you have to install it separately
app.use(bodyParser.json());
// from config.js
const port = process.env.PORT;



/**
 * USER
 */

// -- add new user -----------------

app.post('/users', (req, res)=>{
    // pick 2 props from User object
    var body = _.pick(req.body, ['email', 'password']);
    // new instance of User model
    var user = new User(body);
    
    user.save().then(()=>{
        return user.generateAuthToken();
    })
    .then((token)=>{
        res.header('x-auth', token).send(user);
    })
    .catch((error)=>{
        res.status(400).send(error);
    });
});


// -- private route -----------------
// -- authenticate middleware -----------------

app.get('/users/me', authenticate, (req, res)=>{
    res.send(req.user);
});



// log in a user
app.post('/users/login', (req, res) => {
    // pick 2 props from User object
    var body = _.pick(req.body, ['email', 'password']);
    
    User.findByCredentials(body.email, body.password).then( loggedinUser => {
        //res.send(loggedinUser);
        loggedinUser.generateAuthToken().then( token => {
            res.header('x-auth', token).send(loggedinUser);
        });
    }).catch( error => {
        res.status(400).send(error);
    })
});


// log out user = destroy auth token
app.delete('/users/me/token', authenticate, (req, res) => {
    
    req.user.removeToken(req.token).then( ()=>{
        res.status(200).send();
    },()=>{
        res.status(400).send();
    });
    
});



/**
 * TODO
 */

// -- add new item -----------------

app.post('/todos', authenticate, (req, res)=>{
    var todo = new Todo({
        text: req.body.text,
        _creator: req.user._id
    });

    todo.save().then((doc)=>{
        res.send(doc);
    }, (error)=>{
        res.status(400).send(error);
    });
});


// -- GET all items for currently logged user -----------------

app.get('/todos', authenticate, (req, res)=>{
    Todo.find({
        _creator: req.user._id
    }).then((todos)=>{
        res.send({todos});
    }, (err)=>{
        res.status(400).send(err);
    });
});


// -- GET one item -----------------

app.get('/todos/:id', authenticate, (req, res)=>{
    // get id from route params
    var id = req.params.id;

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    // without authentication
    //Todo.findById(id).then((todo)=>{
    // with authentication    
    Todo.findOne({
        _id: id,
        _creator: req.user._id
    }).then((todo)=>{
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


// -- UPDATE an item -----------------

app.patch('/todos/:id', authenticate, (req, res)=>{
    // get id from route params
    var id = req.params.id;
    var body = _.pick(req.body, ['text', 'completed']);

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    // if is bool and it's true
    if(_.isBoolean(body.completed) && body.completed){
        body.completedAt = new Date().getTime();
    } else {
        body.completed = false;
        body.completedAt = null;
    }

    // return removed object after removal
    // Todo.findByIdAndUpdate(id, {$set: body}, {new: true}).then((todo)=>{
    Todo.findOneAndUpdate({
        _id: id, 
        _creator: req.user._id

        // {new: true} - return updated object rather than original
    }, {$set: body}, {new: true}).then((todo)=>{
        // validate if not null
        if(!todo){
            return res.status(404).send();
        }

        res.send({todo}); 
    }).catch((error)=>{
        res.status(400).send();
    });
});


// -- DELETE one item -----------------

app.delete('/todos/:id', authenticate, (req, res)=>{
    // get id from route params
    var id = req.params.id;

    // validate id
    if(!ObjectID.isValid(id)){
        return res.status(404).send();
    }

    // return removed object after removal
    //Todo.findByIdAndRemove(id).then((todo)=>{
        
    Todo.findOneAndRemove({
        _id: id,
        _creator: req.user._id
    }).then((todo)=>{
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
});




// -------------------
app.listen(port, ()=>{
    console.log(`Server started on port ${port}`)
});

module.exports = {
    app
}
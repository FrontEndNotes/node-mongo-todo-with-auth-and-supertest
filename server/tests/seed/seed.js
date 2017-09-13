const {ObjectID} = require('mongodb');
const jwt = require('jsonwebtoken');

const {Todo} = require('./../../models/todo');
const {User} = require('./../../models/user');


const u1Id = new ObjectID();
const u2Id = new ObjectID();
const u3Id = new ObjectID();

const users = [
    { 
        _id: u1Id,
        email: 'u1@email.com',
        password: 'u1Password',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: u1Id, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    },
    { 
        _id: u2Id,
        email: 'u2@email.com',
        password: 'u2Password',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: u2Id, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    },
    { 
        _id: u3Id,
        email: 'u3@email.com',
        password: 'u3Password',
        tokens: [{
            access: 'auth',
            token: jwt.sign({_id: u3Id, access: 'auth'}, process.env.JWT_SECRET).toString()
        }]
    }
]


const populateUsers = (done)=>{
    User.remove({})
        .then(()=>{
            // insertMany won't fire middleware 'pre'
            // to hash passwords
            // 'pre' runs before 'save'
            var u1 = new User(users[0]).save();
            var u2 = new User(users[1]).save();
            var u3 = new User(users[2]).save();

            return Promise.all([u1, u2, u3]);
        })
        .then(()=>done())
}


const todos = [
    { _id: new ObjectID(), text: 'Feed the cat', _creator: u1Id},
    { _id: new ObjectID(), text: 'Walk the dog', _creator: u1Id},
    { _id: new ObjectID(), text: 'Water the flowers', _creator: u2Id},
    { _id: new ObjectID(), text: 'Iron a shirt', _creator: u2Id},
    { _id: new ObjectID(), text: 'Shut up and dance :)', _creator: u1Id}
]

const populateTodos = (done)=>{
    Todo.remove({})
        .then(()=>{
            return Todo.insertMany(todos)
        })
        .then(()=>done())
}

module.exports = {
    todos,
    populateTodos,
    users,
    populateUsers
}
const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server.async-await');
const {Todo} = require('./../models/todo');
const {User} = require('./../models/user');
const {todos, populateTodos, users, populateUsers} = require('./seed/seed');


// before each test, remove all items and then insert testTodos
beforeEach(populateTodos);
beforeEach(populateUsers);

// -- add new item -----------------

describe('POST /todos', ()=>{
    it('should create a new todo', (done)=>{
        var text = 'Remember the milk';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({text}) // == text:text
            .expect(200)  // status code
            .expect((response)=>{
                expect(response.body.text).toBe(text);
            })
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                Todo.find({text}).then((todos)=>{
                    expect(todos.length).toBe(1);
                    expect(todos[0].text).toBe(text);
                    done();
                }).catch((err)=> done(err));
            })
    })

    it('should not create todo with invalid data', (done)=>{
        var text = 'Remember the milk';

        request(app)
            .post('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .send({})
            .expect(400)
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                Todo.find().then((todos)=>{
                    expect(todos.length).toBe(5);
                    done();
                }).catch((err) => done(err));
            })
    })    
});


// -- GET all items -----------------

describe('GET /todos', ()=>{
    it('should get all todos', (done)=>{
        request(app)
            .get('/todos')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response)=>{
                expect(response.body.todos.length).toBe(3);
            })
            .end(done);
    })  
})


// -- GET one item -----------------

describe('GET /todos/:id', ()=>{
    it('should return todo doc', (done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response)=>{
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    })  

    it('should not return todo doc created by other user', (done)=>{
        request(app)
            .get(`/todos/${todos[2]._id.toHexString()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })  

    it('should return 404 if todo not found', (done)=>{
        request(app)
            .get(`/todos/${ new ObjectID()}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })  
    
    it('should return 404 if for non-object ids', (done)=>{
        request(app)
            .get(`/todos/123abc`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })  
})


// -- DELETE one item -----------------

describe('DELETE /todos/:id', ()=>{
    it('should remove a todo', (done)=>{
        var hexId = todos[1]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response)=>{
                expect(response.body.todo._id).toBe(hexId);
            })
            .end((err, response)=>{
                if(err){
                    return done(err);
                }

                Todo.findById(hexId).then((todo)=>{
                    expect(todo).toNotExist();
                    done();
                }).catch((err)=> done(err));
            });
    })  

    it('should not remove a todo of other user', (done)=>{
        var hexId = todos[2]._id.toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end((err, response)=>{
                if(err){
                    return done(err);
                }

                Todo.findById(hexId).then((todo)=>{
                    expect(todo).toExist();
                    done();
                }).catch((err)=> done(err));
            });
    })  

    it('should return 404 if todo not found', (done)=>{
        var hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })  
    
    it('should return 404 if object id is invalid', (done)=>{
        request(app)
            .delete(`/todos/12345`)
            .set('x-auth', users[0].tokens[0].token)
            .expect(404)
            .end(done);
    })  
})


// -- UPDATE an item -----------------

describe('PATCH /todos/:id', ()=>{
    it('should update the todo', (done)=>{
        var hexId = todos[2]._id.toHexString();
        var text = 'Updated!';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: text,
                completed: true
            })
            .expect(200)
            .expect((response)=>{
                console.log(typeof response.body.todo.completedAt)
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBe(true);
                //expect(response.body.todo.completedAt).toBe('number');
            })
            .end(done);
    });

    it('should not update the todo created by other user', (done)=>{
        var hexId = todos[2]._id.toHexString();
        var text = 'Updated!';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[0].tokens[0].token)
            .send({
                text: text,
                completed: true
            })
            .expect(404)
            .end(done);
    });

    it('should clear completedAt when todo is not completed', (done)=>{
        var hexId = todos[3]._id.toHexString();
        var text = 'Updated text!';

        request(app)
            .patch(`/todos/${hexId}`)
            .set('x-auth', users[1].tokens[0].token)
            .send({
                text: text,
                completed: false
            })
            .expect(200)
            .expect((response)=>{
                expect(response.body.todo.text).toBe(text);
                expect(response.body.todo.completed).toBe(false);
                expect(response.body.todo.completedAt).toNotExist();
            })
            .end(done); 
    });
});


/*******************
 * USER
 */


// -- GET authenticated user -----------------

describe('GET /users/me', ()=>{
    it('should return user if authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .expect((response)=>{
                expect(response.body._id).toBe(users[0]._id.toHexString());
                expect(response.body.email).toBe(users[0].email);
            })
            .end(done);
    });  


    it('should return 401 if not authenticated', (done)=>{
        request(app)
            .get('/users/me')
            .expect(401)
            .expect((response)=>{
                expect(response.body).toEqual({});
            })
            .end(done);
    });  
});


// create new user
describe('POST /users', ()=>{

    it('should create a user if unique valid email and valid password', (done)=>{
        var email = 'validUserEmail@example.com';
        var password = 'validpassword';

        request(app)
            .post('/users')
            .send({email, password})
            .expect(200)
            .expect((response)=>{
                expect(response.headers['x-auth']).toExist();
                expect(response.body._id).toExist();
                expect(response.body.email).toBe(email);
            })
            //.end(done);
            // or
            .end((error)=>{
                if(error){
                    return done(error);
                }

                User.findOne({email}).then(createdUser => {
                    expect(createdUser).toExist();
                    expect(createdUser.password).toNotBe(password);
                    done();
                }).catch( error=> done(error));
            });
    });  
    
    
    it('should return validation errors if request invalid', (done)=>{
        request(app)
            .post('/users')
            .send({email: 'invalidemail', password:'_1a'})
            .expect(400)
            .end(done);
    });  
        
        
    it('should not create user if email in use', (done)=>{
        request(app)
        .post('/users')
        .send({email: users[0].email, password:'validpassword'})
        .expect(400)
        .end(done);
    });  
});



// user login
describe('POST /users/login', ()=>{

    // user[2] has no 'tokens' array - servers to test login
    it('should login user and return auth token', (done)=>{

        request(app)
            .post('/users/login')
            .send({
                email: users[2].email, 
                password: users[2].password
            })
            .expect(200)
            .expect((response)=>{
                expect(response.headers['x-auth']).toExist();
            })
            //.end(done);
            // or
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                User.findById(users[2]._id).then(user => {
                    expect(user.tokens[1]).toInclude({
                        access: 'auth',
                        token: res.headers['x-auth']
                    });
                    done();
                }).catch( error => done(error));
            });
    });  
    
    
    it('should reject invalid login', (done)=>{
        request(app)
        .post('/users/login')
        .send({
            email: users[2].email, 
            password: 'asd43ewfd'
        })
        .expect(400)
        .expect((response)=>{
            expect(response.headers['x-auth']).toNotExist();
        })
        //.end(done);
        // or
        .end((err, res)=>{
            if(err){
                return done(err);
            }

            User.findById(users[2]._id).then(user => {
                expect(user.tokens.length).toBe(1);
                done();
            }).catch( error => done(error));
        });
    });  
});


// user logout- destroy auth token
describe('DELETE /users/me/token', ()=>{

    // user[0] and user[1] have tokens to test
    it('should remove auth token on logout', (done)=>{

        request(app)
            .delete('/users/me/token')
            .set('x-auth', users[0].tokens[0].token)
            .expect(200)
            .end((err, res)=>{
                if(err){
                    return done(err);
                }

                User.findById(users[0]._id).then(user => {
                    expect(user.tokens.length).toBe(0);
                    done();
                }).catch( error => done(error));
            });
    });  
});
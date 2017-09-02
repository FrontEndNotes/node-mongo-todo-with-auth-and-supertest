const expect = require('expect');
const request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');


const testTodos = [
    { _id: new ObjectID(), text: 'Feed the cat'},
    { _id: new ObjectID(), text: 'Walk the dog'},
    { _id: new ObjectID(), text: 'Water the flowers'},
    { _id: new ObjectID(), text: 'Iron a shirt'},
    { _id: new ObjectID(), text: 'Shut up and dance :)'}
]

// before each test, remove all items and then insert testTodos
beforeEach((done)=>{
    Todo.remove({})
        .then(()=>{
            return Todo.insertMany(testTodos)
        })
        .then(()=>done())
})


// -- add new item -----------------

describe('POST /todos', ()=>{
    it('should create a new todo', (done)=>{
        var text = 'Remember the milk';

        request(app)
            .post('/todos')
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
            .expect(200)
            .expect((response)=>{
                expect(response.body.todos.length).toBe(5);
            })
            .end(done);
    })  
})


// -- GET one item -----------------

describe('GET /todos/:id', ()=>{
    it('should return todo doc', (done)=>{
        request(app)
            .get(`/todos/${todos[0]._id.toHexString()}`)
            .expect(200)
            .expect((response)=>{
                expect(response.body.todo.text).toBe(todos[0].text);
            })
            .end(done);
    })  

    it('should return 404 if todo not found', (done)=>{
        request(app)
            .get(`/todos/${ new ObjectID()}`)
            .expect(404)
            .end(done);
    })  
    
    it('should return 404 if for non-object ids', (done)=>{
        request(app)
            .get(`/todos/123abc`)
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

    it('should return 404 if todo not found', (done)=>{
        var hexId = new ObjectID().toHexString();

        request(app)
            .delete(`/todos/${hexId}`)
            .expect(404)
            .end(done);
    })  
    
    it('should return 404 if object id is invalid', (done)=>{
        request(app)
            .delete(`/todos/12345`)
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

    it('should clear completedAt when todo is not completed', (done)=>{
        var hexId = todos[3]._id.toHexString();
        var text = 'Updated text!';

        request(app)
            .patch(`/todos/${hexId}`)
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
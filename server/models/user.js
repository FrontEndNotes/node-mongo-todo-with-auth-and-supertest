const mongoose = require('mongoose');
const validator = require('validator');
const jwt = require('jsonwebtoken');
const _ = require('lodash');
const bcrypt = require('bcryptjs');


var UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true, // unique across User collection
        validate: {
            validator: validator.isEmail,
            // equal to:
            // validator: (value) => {
            //     return validator.isEmail(value);
            // }, 
            message: '{VALUE} is not valid email'
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    // MongoDB feature
    tokens: [
        {
            access: {
                type: String,
                required: true
            },
            token: {
                type: String,
                required: true
            }
        }
    ]
});



// methods - related to instance of a model
UserSchema.methods.toJSON = function () {
    var user = this;
    // convert Mangoose document to JS object
    var userObject = user.toObject();

    // limit user properties send back to app
    return _.pick(userObject, ['_id', 'email']);
}



// functions instead of arrow function, 
// because of 'this' keyword
// this - stores individual document
UserSchema.methods.generateAuthToken = function () {
    var user = this;
    var access = 'auth';

    var token = jwt.sign({
        _id: user._id.toHexString(),
        access
    }, process.env.JWT_SECRET).toString();

    user.tokens.push({
        access,
        token
    });

    return user.save().then(()=>{
        return token;
    });
}



UserSchema.methods.removeToken = function (tokenToRemove) {
    var user = this;

    //$pull - remove items from an array that match certain criteria
    return user.update({
        $pull: {
            tokens: {
                token: tokenToRemove
            }
        }
    });
}



// statics - related to model (not instance)
UserSchema.statics.findByToken = function(token){
    // uppercase - model not instance
    var User = this;
    var decoded;

    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        // return new Promise((resolve, reject)=>{
        //     reject();
        // })
        // equal to above
        return Promise.reject();
    }

    return User.findOne({
        '_id': decoded._id,
        'tokens.access': 'auth',
        'tokens.token': token
    });
}

// statics - related to model (not instance)
// password - plain text, not hashed 
UserSchema.statics.findByCredentials = function(email, password){
    //console.log('-- findByCredentials --');
    // uppercase - model not instance
    var User = this;

    return User.findOne({email}).then( foundUser => {
        if(!foundUser){
            //console.log('- !foundUser');
            return Promise.reject();
        } 
        
        //console.log('- foundUser', foundUser);
        return new Promise( (resolve, reject) => {
            // compare password and user.password
            // params - plain password, hashed password, callback
            bcrypt.compare(password, foundUser.password, (err, res)=>{
                if (res) {
                    //console.log('- resolve(user) ');
                    resolve(foundUser);  
                } else {
                    //console.log('- reject() ');
                    reject();
                }
            })
        });
    })
}

// mongoose middleware 'pre' used before 'save' 
// - before saving user to the db
UserSchema.pre('save', function(next){
    var user = this;

    // encrypt password if it was mmodified
    if(user.isModified('password')){

        // 10 rounds
        // hashing password
        bcrypt.genSalt(10, (err, salt)=>{
            bcrypt.hash(user.password, salt, (error, hash)=>{
                user.password = hash;
                next();
            })
        });

    } else {
        next();
    }
})


//  can't add methods to model
var User = mongoose.model('User', UserSchema);

module.exports = {User};
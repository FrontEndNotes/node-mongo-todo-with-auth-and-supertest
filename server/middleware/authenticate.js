var {User} = require('./../models/user');


function authenticate(req, res, next) {
    var token = req.header('x-auth');
    
    User.findByToken(token).then((user)=>{
        // query couldn't find a user for some reason
        if(!user){
            // will skip to 'catch' clause
            return Promise.reject();
        }

        //res.send(user);
        req.user = user;
        req.token = token;
        next();
    })
    .catch((error)=>{
        // 401 - authentication is required
        res.status(401).send();
    });  
}

module.exports = {
    authenticate
}
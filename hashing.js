const {SHA256} = require('crypto-js');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

var message = 'I am admin user';
// one way hashing
var hash = SHA256(message).toString();

console.log(`Message: ${message}`);
console.log(`Hash: ${hash}`);

var data = {
    id: 4
}
var token = {
    data,
    hash: SHA256(JSON.stringify(data).toString())
}

// sign(data, secret salt)
var token = jwt.sign(data, '123abc');
console.log(token)

var decoded = jwt.verify(token, '123abc');
console.log(decoded)


// bcrypt
var password = '34wrefsduhf';
// 10 rounds
bcrypt.genSalt(10, (err, salt)=>{
    bcrypt.hash(password, salt, (error, hash)=>{
        console.log(hash)
    })
})

var hashedPassword = '$2a$10$dBAd1XKRg6k93au/dZHLC.PXRgGdw6fo1gjztUyDvBuxQ.zHu6bVy'
bcrypt.compare(password, hashedPassword, (error, result)=>{
    console.log(result)
});

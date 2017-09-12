var env = process.env.NODE_ENV || 'development';


// config.json should be added to .gitignore
// 'test' is set in package.json scripts section
if(env === 'development' || env === 'test'){
    var config = require('./config.json');
    var envConfig = config[env];

    // PORT, MONGODB_URI, JWT_SECRET
    // JWT_SECRET - randomly generated
    Object.keys(envConfig).forEach((key)=>{
        process.env[key] = envConfig[key];
    });
}


// without hidden (not stored in git) config.json
// if(env === 'development'){
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoApp';
//     process.env.JWT_SECRET: '02weoufbdjscr';
// } else if (env === 'test'){
//     process.env.PORT = 3000;
//     process.env.MONGODB_URI = 'mongodb://localhost:27017/TodoAppTest';
//     process.env.JWT_SECRET: 'j5y4erfdsfgty6';
// }
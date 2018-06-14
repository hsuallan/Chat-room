const mongoose = require("mongoose");
const users = mongoose.Schema({
    "uid": String,
    "email":String,
    "pw":String,
    "online": Boolean,
    "socket_id": String,
    "login_time":Number,
},
    {
        "versionKey": false
    });
module.exports = mongoose.model('users', users);//1 = collection
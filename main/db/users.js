const mongoose = require("mongoose");
const users = mongoose.Schema({
    "uid": String,
    "pw":String,
    "online": Boolean,
    "socket_id": String,
},
    {
        "versionKey": false
    });
module.exports = mongoose.model('users', users);//1 = collection
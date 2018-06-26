const mongoose = require("mongoose");
const online = mongoose.Schema({
    "uid": String,
    "socket_id": String,
    "login_time": Number,
},
    {
        "versionKey": false
    });
module.exports = mongoose.model('online', online);//1 = collection
const mongoose = require("mongoose");
const users = mongoose.Schema({
    "uid": String,
    "email":String,
    "pw": String, 
    "otp":String
},
    {
        "versionKey": false
    });
module.exports = mongoose.model('users', users);//1 = collection
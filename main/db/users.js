const mongoose = require("mongoose");
const users = mongoose.Schema({
    "uid": String,
    "pw": String, 
    "otp":String,
    "passkey":String
    
},
    {
        "versionKey": false
    });
module.exports = mongoose.model('users', users);//1 = collection

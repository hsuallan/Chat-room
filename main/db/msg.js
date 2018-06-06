const mongoose = require("mongoose");
const msg = mongoose.Schema({
    "uid": String,
    "msg": String,
    "time": Number,
}, {
        "versionKey": false
    });
module.exports = mongoose.model('msg', msg);//1 = collection

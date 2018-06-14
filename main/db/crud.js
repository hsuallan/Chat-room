const u = require("./users");
const m = require("./msg")
const mongoose = require("mongoose");
class crud {
    constructor() {
        this.db;
    }
    connect() {
        this.db = mongoose.connect('mongodb://localhost:27017/mydb');
        this.db.Promise = global.Promise;
    }
    user_add(profile) {
        const newuser = new u({
            "uid": profile.uid,
            "pw": profile.pw,
            "email":profile.email,
            "online": false,
            "socket_id": "",
            "login_time": "",
        });
        newuser.save(function (err) {if(err) throw err });
        console.log(newuser+" is save");
    }
   
    user_find(uid, cb) {
        return u.findOne({ "uid": uid }, cb);
    }
    user_login(socket) {
        return u.update({ "uid": socket.uid }, {"online":true,"socket_id":socket.id,"login_time":socket.login_time});
    }
    user_login_out(socket) {
        return u.update({ "socket_id": socket.id }, { "online": false, "socket_id":null,"login_time":null});
    }
    user_online() {
        return u.find({ "online": true });
    }
    msg_add(uid, msg) {
        const newmsg = new m({
            "uid": uid,
            "msg": msg,
            "time": new Date().valueOf(),
        });
        newmsg.save().then(console.log(newmsg['msg']+" save "));
    }
    msg_getpass(socket) {
        return m.find({ "time": { $lte: socket.login_time }});
    }
}
module.exports = crud;
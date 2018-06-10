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
    user_add(socket) {
        const newuser = new u({
            "uid": socket.user_id,
            "pw":null,
            "online": true,
            "socket_id": socket.id,
        });
        newuser.save(function (err) {if(err) throw err });
        console.log(newuser+" is save");
    }
    user_login_in(id,password) {

    }
    user_login_out(socket) {
        return u.update({ "uid": socket.user_id }, { "online": false, "socket_id":null});
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
    msg_getpass() {
        return m.find({});
    }
}
module.exports = crud;
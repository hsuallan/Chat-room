const u = require("./users");
const m = require("./msg");
const o = require("./online");
const mongoose = require("mongoose");
const cfg = require("../config/config");
class crud {
    constructor() {
        this.db;
    }
    connect() {
        this.db = mongoose.connect(cfg.DB);
        this.db.Promise = global.Promise;
    }
    user_add(profile) {
        const newuser = new u({
            "uid": profile.uid,
            "pw": profile.pw,
            "email": profile.email,
            "otp":profile.otp
        });
        newuser.save(function (err) {if(err) throw err });
        console.log(newuser+" is save");
    }
    user_find(uid, cb) {
        return u.findOne({ "uid": uid }, cb);
    }
    user_login(socket) {
        const no = new o({
            "uid": socket.uid ,
            "socket_id": socket.id ,
            "login_time": socket.login_time,
        });
        no.save((err) => { if (err) throw err; });
        console.log(no["uid"] + "is login");
    }
    user_login_out(socket) {
        o.deleteOne({ "uid": socket.uid }, (err) => {
            if (err) throw err;
            console.log(socket.uid + " log out");
        });
    }
    user_online() {
        return o.find();
    }
    is_online(uid) {
        return o.findOne({"uid":uid});
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
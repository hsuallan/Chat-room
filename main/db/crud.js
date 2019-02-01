const u = require("./users");
const m = require("./msg");
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
            "otp":profile.otp,
            "passkey":profile.passkey
        });
        newuser.save(function (err) {if(err) throw err });
        console.log(newuser['uid']+" is save");
    }
    user_find(uid, cb) {
        return u.findOne({ "uid": uid }, cb);
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

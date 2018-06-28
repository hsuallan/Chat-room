var express = require('express');
var path = require("path");
var jwt = require('jsonwebtoken');
var crud = require("../db/crud");
var router = express.Router();
var cfg = require("../config/config");
var speakeasy = require('speakeasy');
var qrcode = require("qrcode");
const dbcrud = new crud();

dbcrud.connect();
router.get('/', function (req, res) {
    res.sendfile(path.join('public/html/index.html'));
});
router.post('/login', function (req, res) {
    dbcrud.user_find(req.body.uid, function (err, account) {
        var seed = JSON.parse(account.otp);
        var token = speakeasy.totp({
            secret: seed["base32"],
            encoding: 'base32'
        });
        if (err) {
            return res.status(203).json({
                err: err.msg
            });
        }
        if (!account) {
            return res.status(203).json({
                err: "Invalid username Make sure username is correctly",
                type:"u"
            });
        }
        if (account.pw != req.body.pw) {
            return res.status(203).json({
                err: "Wrong password Make sure password is correctly",
                type: "p"
            });
        }
        if (token != req.body.otp) {
            return res.status(203).json({
                err: "Wrong otp Make sure you enter in correct otp or correct time",
                type: "o"
            });
        }
        dbcrud.is_online(account.uid).exec((err, docs) => {
            if (err) throw err;
            var profile = {
                uid: account.uid,
                email: account.email
            };
            if (docs == null) {//沒上線
                
                var token = jwt.sign(profile, cfg.jwt_secret, { expiresIn: 60 * 360000 });
                return res.status(200).json({ token: token });
            }
            else {
                console.log(docs);
                return res.status(203).json({
                    err: "User is online now ,please log out from other device",
                    type: "x"
                });

            }
        });
       

    });

})
router.post('/newAccount', function (req, res) {
    dbcrud.user_find(req.body.uid, function (err, account) {
        if (err) {
            return res.status(203).json({
                pageData: {
                    err: err.message
                }
            });
        }
        if (account) {
            return res.status(203).json({
                pageData: {

                    err: "uid " + account.uid + " already registered please use other uid"

                }
            });
        } 
        var seed = JSON.parse(req.body.seed);
        var token = speakeasy.totp({
            secret: seed["base32"],
            encoding: 'base32'
        });
        if (token != req.body.otp) {
            return res.status(203).json({
                pageData: {
                    err: "err otp make sure you enter correct otp or have correct time"
                }
            });
        }
        var profile = {
            "uid": req.body.uid,
            "pw": req.body.pw,
            "email": req.body.email,
            "otp": req.body.seed//not json obj!!!
        };

        dbcrud.user_add(profile);
        return res.status(200).json({
            pageData: {
                msg: "uid " + req.body.uid + " register successfully Now you can  use the account to log in"
            }
        });
    });


});
router.post("/otpseed", (req, res) => {
    var seed = speakeasy.generateSecret({ name: "chat-room" });
    qrcode.toDataURL(seed.otpauth_url, (err, data) => {
        return res.status(200).json({
            seed: seed,
            data:data
        })
    });
})
module.exports = router;
var express = require('express');
var router = express.Router();
var path = require("path");
var jwt = require('jsonwebtoken');
var crud = require("../db/crud");
const dbcrud = new crud();
const secret = "12345678";
dbcrud.connect();
router.get('/', function (req, res) {
    res.sendfile(path.join('public/html/index.html'));
});
router.post('/login', function (req, res) {
    dbcrud.user_find(req.body.uid, function (err, account) {
        if (err) {
            return res.status(203).json({
                err: err.msg
            });
        }
        if (!account) {
            return res.status(203).json({
                err: "Invalid username"
            });
        }
        if (account.pw != req.body.pw) {
            return res.status(203).json({
                err: "Wrong pw"
            });
        }

        var profile = {
            uid: account.uid,
            online: account.online,
            socket_id: account.sockt_id,
            email: account.email
        };

        if (account.pw == req.body.pw) {
            var token = jwt.sign(profile,secret, { expiresIn: 60 * 360000 });
            console.log(profile);
            return res.status(200).json({ token: token });
        }

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

                    err: "uid " + account.uid + " already registered"

                }
            });
        }
        if (req.body.uid == "") {
            return res.status(203).json({
                pageData: {
                    err: "uid cannot be empty"
                }
            });
        }

        var profile = {
            "uid": req.body.uid,
            "pw": req.body.pw,
            "email": req.body.email
        };

        dbcrud.user_add(profile);
        return res.status(200).json({
            pageData: {
                msg: "uid " + req.body.uid + " register successfully"
            }
        });
    });


});
module.exports = router;
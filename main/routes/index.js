var express = require('express');
var router = express.Router();
var path = require("path");
var jwt = require('jsonwebtoken');
var crud = require("../db/crud");
const dbcrud = new crud();
const secret = "12345678";
dbcrud.connect();
router.get('/', function (req, res) {
    res.sendfile(path.join('public/html/login.html'));
});
router.get('/chat', function (req, res) {
    res.sendfile(path.join('public/html/index.html'));
});

router.post('/login', (req, res) => {
    //console.log(req.body);
    let l = dbcrud.user_login(req.body.lgid, req.body.lgpw);
    l.exec((err, docs) => {
        if (err) throw err;
        console.log(docs);
        if (docs.length == 0) {
            res.json({ "message": "auth err" });
        }
        else {
            let token = jwt.sign(docs, secret, { expiresIn: 60 * 60 * 24 });
            res.json({
                "user": docs,
                "token":token,
            });
            //  res.sendfile(path.join('public/html/index.html'));
        }
    });
});
router.post('/new', (req, res) => {
    let n = dbcrud.newuser(req.body);
    n.exec((err, docs) => {
        if (err) throw err;
        if (docs.length == 0) {
            /*no find*/

        }
        else {
            res.end("Uid exist");
        }
    });
});
module.exports = router;
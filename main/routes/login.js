var express = require('express');
var router = express.Router();
var path = require("path");
var crud = require('../db/crud');
router.post('/login', (req, res) => {
    console.log(req.query);
    
    let l = crud.user_login(res.query.lgid, res.query.lgpw);
    l.exec(() => {

    });
});
//module.exports = router;
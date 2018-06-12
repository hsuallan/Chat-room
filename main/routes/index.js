var express = require('express');
var router = express.Router();
var path = require("path");
router.get('/', function (req, res) {
    res.sendfile(path.join('public/html/index.html'));
});
module.exports = router;
var fs = require('fs');
var cfg = require('../config/config');
//ssl license

var keyPath =cfg.keyPath;
var certPath = cfg.certPath;

var hskey = fs.readFileSync(keyPath);
var hscert = fs.readFileSync(certPath);

var options = {
    key: hskey,
    cert: hscert
};

//ssl object

var ssl = {};

ssl.options = options;

module.exports = ssl;
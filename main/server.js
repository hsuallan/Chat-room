'use strict';
var express = require('express');
var app = require("express")();
var path = require('path');
var socketioJwt = require('socketio-jwt');
var bodyParser = require('body-parser');
var logger = require('morgan');
var https = require('https');
var debug = require('debug');
var crud = require("./db/crud");
var ssl = require('./SSL/SSL');
var server = https.createServer(ssl.options, app);
var io = require('socket.io')(server);
var routes = require('./routes/index.js');
var cfg = require("./config/config");
// make a server by express
app.set('port', process.env.PORT || 3000);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use('/', routes);
io.set('authorization', socketioJwt.authorize({
    secret: cfg.jwt_secret,
    handshake: true
}));
io.clients((err, cli) => {
    if (err) throw err;
    console.log(cli);
});
io.on('connection', (socket) => {
    //console.log(dbcrud);
    const dbcrud = new crud();
    dbcrud.connect(); 
    let f_timestamp = new Date().valueOf();
    socket.on('user login', (uid)=> {
        socket.uid = uid;
        socket.login_time = new Date().valueOf();
        io.to(socket.id).emit('welcome message', "Welcome to chat room If you need help  plz enter in ", "<strong>.help</strong>")  
        dbcrud.user_login(socket);
    }); 
    socket.on('online', () => {
        dbcrud.user_online().exec((err, docs) => {
            if (err) throw err;
            io.emit('online', docs);
        });
    });
    socket.on('pass', () => {
        let p = dbcrud.msg_getpass(socket);
        p.exec((err, docs) => {
            io.to(socket.id).emit('pass', "----pass message-----");
            docs.reverse();
            docs.forEach((li) => {
                io.to(socket.id).emit('pass', li["uid"],li["msg"]);
            });
            io.to(socket.id).emit('pass',"----pass message-----");
        });
    });
    socket.on('chat room', (uid, msg) => {
        if (msg == '.help') {
            io.to(socket.id).emit('alert', 'Enter in message then you can send, Enjoy chat with people');
        } else {
            let l_timestamp = new Date().valueOf();
            if (l_timestamp - f_timestamp > 1000) {
                io.emit('chat room', uid, msg);
                dbcrud.msg_add(uid, msg);
                f_timestamp = new Date().valueOf();
            }
            else { io.to(socket.id).emit('alert', "Don't message flooding"); }
        }
    });
    socket.on('disconnect', () => {
        if (!socket.uid) socket.uid = 'Someone';
        io.emit('leave message', socket.uid + " is out");
        dbcrud.user_login_out(socket);
        dbcrud.user_online().exec((err, docs) => {
            if (err) throw err;
            io.emit('online', docs);
        });
    });
});

server.listen(app.get('port'), ()=> {
    console.log('listening on ' + app.get('port'));
});

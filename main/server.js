'use strict';
var express = require('express');
var app = require("express")();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var logger = require('morgan');
var debug = require('debug');

var crud = require("./db/crud");
var routes = require('./routes/index.js');
// make a server by express
app.set('port', process.env.PORT || 3000);
app.use(express.static(path.join(__dirname, 'public')));
app.use(logger('dev'));
app.use('/', routes);
io.clients((err, cli) => {
    if (err) throw err;
    console.log(cli);
});
io.on('connection', (socket) => {
    //console.log(dbcrud);
    dbcrud = new crud();
    dbcrud.connect(); 
    let f_timestamp = new Date().valueOf();
    socket.on('new user', (uid)=> {
        socket.user_id = uid;
        io.to(socket.id).emit('welcome message', "Welcome to chat room If you need help  plz enter in ", "<strong>.help</strong>")  
        dbcrud.user_add(socket);
    }); 
    socket.on('online', () => {
        dbcrud.user_online().exec((err, docs) => {
            if (err) throw err;
            io.emit('online', docs);
        });
    });
    socket.on('pass', () => {
        let p = dbcrud.msg_getpass();
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
        if (!socket.user_id) socket.user_id = 'Someone';
        io.emit('leave message', socket.user_id + " is out");
        dbcrud.user_login_out(socket).exec(() => {
            dbcrud.user_online().exec((err, docs) => {
                if (err) throw err;
                io.emit('online', docs);
                console.log('emit');
            });
        });
       
    });
});
server.listen(app.get('port'), ()=> {
    console.log('listening on ' + app.get('port'));
});

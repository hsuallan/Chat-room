/*'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/
var express = require('express')
var app = require("express")();
var http = require("http").Server(app);
var path = require('path');
var io = require("socket.io")(http);
var crud = require("./db/crud");
// make a server by express
app.use(express.static(path.join(__dirname, 'public')));

app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
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
            docs.forEach((li) => {
                io.to(socket.id).emit('chat room', li["uid"], li["msg"]);
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
            else { io.to(socket.id).emit('alert', "§O¬~ª©"); }
        }
    });
    socket.on('disconnect', () => {
        if (!socket.user_id) socket.user_id = 'Someone';
        io.emit('leave message', socket.user_id + " is out");
        dbcrud.user_login_out(socket);
        dbcrud.user_online().exec((err, docs) => {
            if (err) throw err;
            io.emit('online', docs);
        });
    });
});

http.listen(1337, ()=> {
    console.log('listening on *:1337');
});
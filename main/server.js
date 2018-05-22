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
    //console.log(socket.id);
    socket.on('new user', (uid)=> {
        socket.user_id = uid;
        io.to(socket.id).emit('welcome message',"Welcome to chat room If you need help  plz enter in .help ")
    });
    socket.on('disconnect', () => {
        if (!socket.user_id) socket.user_id = 'Someone';
        io.emit('leave message',  socket.user_id+" is out");
    });
    socket.on('chat room', (uid, msg) => {
        if (msg == '.help') {
            io.to(socket.id).emit('alert', 'This is help message');
        } else {
            io.emit('chat room', uid, msg);    
        }
    });
});

http.listen(1337, ()=> {
    console.log('listening on *:1337');
});
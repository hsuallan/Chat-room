/*'use strict';
var http = require('http');
var port = process.env.PORT || 1337;

http.createServer(function (req, res) {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Hello World\n');
}).listen(port);
*/
var app = require("express")();
var http = require("http").Server(app);
var io = require("socket.io")(http);
// make a server by express
app.get("/", (req, res) => {
    res.sendFile(__dirname + '/index.html');
});
io.on('connection', function (socket) {
    socket.on('chat message', function (msg) {
        io.emit('chat message',msg);
    });
    socket.on('chat id', (id) => {
        io.emit('chat id', id);
    })
});

http.listen(1337, function () {
    console.log('listening on *:1337');
});
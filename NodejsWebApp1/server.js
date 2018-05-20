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
io.on('connection', (socket) => {
    let table = {};
    let sid = socket.id;
    //console.log(socket.id);
    socket.on('disconnect', () => {
        io.emit('alert', "someone is out");
    });
    socket.on('chat room', (uid,msg)=> {
        io.emit('chat room', uid, msg);
        table = { uid, sid };
        console.log(table);
        
    });
});

http.listen(1337, ()=> {
    console.log('listening on *:1337');
});
'use strict';
const express = require('express');
const app = require("express")();
const path = require('path');
const socketioJwt = require('socketio-jwt');
const bodyParser = require('body-parser');
const logger = require('morgan');
const https = require('https');
const crud = require("./db/crud");
const ssl = require('./SSL/SSL');
const server = https.createServer(ssl.options, app);
const io = require('socket.io')(server);
const routes = require('./routes/index.js');
const cfg = require("./config/config");
let users = new Map();//key = uid ,value = socket.id
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
        users.set(uid,socket.id);
        let users_arr = Array.from(users.keys());
        console.log(users_arr)
        io.to(socket.id).emit('welcome message', "Welcome to chat room If you need help  plz enter in ", "<strong>.help</strong>")
        io.emit('online',users_arr);
    }); 
    socket.on('online', () => {
        /*
        dbcrud.user_online().exec((err, docs) => {
            if (err) throw err;
            io.emit('online', docs);
        });
        */
    //  io.emit('online',users)
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
            io.to(socket.id).emit('alert',
               `Enter in message then you can send, Enjoy chat with people
                You can use @uid to send private massage
                Notice : all Private msg will no be store`
                );
        }
        else if (msg.match("^@")) {
             let msg_arr = msg.split(" ");//a[0] = id ,a[>1] = msgs
             let duid = msg_arr[0];//distinct uid
             duid = duid.substr(1);
             if(users.get(duid) === undefined||users.get(duid)==uid){
                o.to(socket.id).emit('alert', 'Make sure you enter an online id');
             }
             else{
                msg = msg.substr(duid.length + 1);
                    
                let l_timestamp = new Date().valueOf();
                    if (l_timestamp - f_timestamp > 1000) {
                        io.to(users.get(duid)).emit("pm", uid, msg);
                        io.to(socket.id).emit("pm", uid, msg);
                        f_timestamp = new Date().valueOf();
                    }
                    else { io.to(socket.id).emit('alert', "Don't message flooding"); }
             }
             /*
             dbcrud.is_online(duid).exec((err, doc) => {
                if (err) throw err;
                if (doc == null || doc["uid"]==socket.uid) {//not online
                    io.to(socket.id).emit('alert', 'Make sure you enter an online id');
                }
                else {
                    let dsid = doc["socket_id"];
                    msg = msg.substr(duid.length + 1);
                    let l_timestamp = new Date().valueOf();
                    if (l_timestamp - f_timestamp > 1000) {
                        io.to(dsid).emit("pm", uid, msg);
                        io.to(socket.id).emit("pm", uid, msg);
                        f_timestamp = new Date().valueOf();
                    }
                    else { io.to(socket.id).emit('alert', "Don't message flooding"); }
                }
             });*/
        }
        else {
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
        users.delete(socket.uid)
        io.emit('leave message', socket.uid + " is out");
        
    });
});

server.listen(app.get('port'), ()=> {
    console.log(`listening on ${app.get('port')}`);
});

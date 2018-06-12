$(function () {
    let socket = io();
    var uid;
    //login in
    $('#lgform').submit(() => {
        uid = $("#lgid").val();
        $('#u').val(uid);
        socket.emit('new user', uid);
        socket.emit('online');
        $("#creat-page").remove();
        $("#login-page").fadeOut();
        $("#chat-page").show();
        return false;
    });
    $('#nc').click(() => {
        $("#login-page").fadeOut();
    });
    $('#bk').click(() => {
        $("#login-page").fadeIn();
    });
    $('#b').click(() => {
        socket.emit('pass');
        $('#b').hide();
    });
    $('#chat-form').submit(() => {
        socket.emit('chat room', uid, $('#m').val());
        $('#m').val('');
        return false;
    });
    socket.on('welcome message', (msg, cmd) => {//someone join call it
        $('#messages').append($('<li style = "color: darkorchid;">').text(msg).append(cmd));
    });
    socket.on('pass', (id, msg) => {
        if (msg == undefined) $('#messages').prepend($('<li style = "color:firebrick;">').text(id));
        else $('#messages').prepend($('<li style = "color:firebrick;">').text(id + " : " + msg));
    });
    socket.on('chat room', (id, msg) => {
        $('#messages').append($("<li>").text(id + " : " + msg));
    });
    socket.on('leave message', (msg) => {//someone leave call it
        $('#messages').append($("<li>").text(msg));
    });
    socket.on('alert', (msg) => {
        alert(msg);
    });
    socket.on('online', (docs) => {
        $('#oul').empty();
        $('#oul').append($("<content>").text("Now online : " + docs.length));
        docs.reverse();
        docs.forEach((c) => {
            $('#oul').append($("<li>").text("Uid : " + c.uid));
        });
    });
});
window.onbeforeunload = function (event) {//out alert message
    event.returnValue = "";
};
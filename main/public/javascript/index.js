$(function () {
    //let socket = io();
    var user_s = new user();
    var uid;
    //login in
    $("#ctform").submit(() => {
        var Email = $('#ctmail').val();
        var id = $('#ctid').val();
        var pw = $('#ctpw').val();
        if ($('#rectpw').val() != pw) {
            $("#ctmsg").text("Make sure you enter in the password correctly");
            $("#ctpw").val("");
            $("#rectpw").val("");
            return false;
        }
        $.post("/newAccount", {
            email: Email,
            uid: id,
            pw: pw
        }).done((result) => {
            var data = result.pageData;
            if (data.err) {
                $("#ctmsg").text(data.err);
            }
            if (data.msg) {
                $("#login-page").fadeIn();
                $('#lgid').val(id);
                $('#lgpw').val(pw);
                $('#lgmsg').text("uid "+id +" Register successfully Now you can log in");
            }

        });
        return false;
    });
    $('#lgform').submit(() => {
        var id = $('#lgid').val();
        var pw = $('#lgpw').val();
        $.post("/login", {
            uid: id,
            pw: pw
        }).done((data) => {
            if (data.err) {
                $('#lgmsg').text(data.err);
                if (data.type == "u") {
                    $('#lgid').val(""); 
                }
                $('#lgpw').val("");
            }
            if (data.token) {
                user_s._token = data.token;
                user_s.connectSocket('/');
                $('#u').val(user_s.decodedJWT().uid);
                $("#creat-page").remove();
                $("#login-page").fadeOut();
                $("#chat-page").show();
                return false;

            }
        });
        return false;
    });
    $('#nc').click(() => {
        $("#login-page").fadeOut();
    });
    $('#bk').click(() => {
        $("#login-page").fadeIn();
    });
    $('#pass').click(() => {
        user_s._socket.emit('pass');
        $('#pass').hide();
    });
    $('#chat-form').submit(() => {
        user_s._socket.emit('chat room', user_s.decodedJWT().uid, $('#m').val());
        $('#m').val('');
        return false;
    });
});
var user = function () {
    this.initilize.call(this);
}

user.prototype.initilize = function () {
    this._socket = 0;
    this._token = 0;
}

user.prototype.decodedJWT = function () {
    if (this._token === 0) return false;
    var b64 = this._token;
    var body = b64.match(/[.](\S+)[.]/);
    var buf = atob(body[1]);
    var obj = JSON.parse(buf);
    return obj;
}
user.prototype.connectSocket = function (namespace) {
    this._socket = io.connect(namespace, {
        query: 'token=' + this._token
    })
    var socket = this._socket;
    var uid = this.decodedJWT().uid;
    socket.on('connect', function () {
        $.ajaxSetup({
            headers: {
                'x-access-token': this._token
            }
        }) 
        socket.emit('user login', uid);
        socket.emit('online');
    });

    socket.on('disconnect', function () {

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
}
window.onbeforeunload = function (event) {//out alert message
    event.returnValue = "";
};
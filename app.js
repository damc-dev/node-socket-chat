var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html');
});

var users = [];

io.on('connection',function(socket) {
	users.push(socket);
	console.log('a user connected');
	socket.on('user:connected', function(user) {
		console.log(user.name + " has connected");
		io.emit('user:joined', user.name + " has joined.");
	})

	socket.on('chat message', function(msg) {
		console.log('message: ' + msg);
		io.emit('chat message', msg);
	});
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
});

http.listen(3000, function(){
	console.log('listining on *:3000');
});

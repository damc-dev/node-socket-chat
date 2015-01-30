var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var clients = [];

app.get('/', function(req, res){
	res.sendFile(__dirname + '/static/index.html');
});

io.on('connection', handleClient);

http.listen(3000, function(){
	console.log('listining on *:3000');
});

function handleClient(socket) {
	console.log('a user connected');
    
	socket.on('user:connected', function(user) {
        clients[socket.id] = user;
		console.log(user.name + " has connected");
		io.emit('user:joined', {'name': user.name});
	});

	socket.on('message', function(message) {
        var envelope = {};
        envelope.userName = clients[socket.id].name;
        envelope.msg = message;
		console.log( envelope.userName + ': ' + envelope.msg);
		io.emit('message', envelope);
	});
    
	socket.on('disconnect', function(){
		console.log('user disconnected');
	});
}


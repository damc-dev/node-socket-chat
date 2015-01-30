var should = require('should');
var io = require('socket.io-client');

var socketURL = 'http://localhost:3000';

var options ={
  transports: ['websocket'],
  'force new connection': true
};

var chatUser1 = {'name':'Tom'};
var chatUser2 = {'name':'Sally'};
var chatUser3 = {'name':'Dana'};

describe("Chat Server",function(){

  it('should broadcast new user to all users', function(done) {

    var client1 = io.connect(socketURL, options);

    client1.on('connect', function(data){
      client1.emit('user:connected', chatUser1);

      var client2 = io.connect(socketURL, options);
      client2.on('connect',function(data) {
        client2.emit('user:connected', chatUser2);
      });

      client2.on('user:joined', function(user) {
        user.should.equal(chatUser2.name + " has joined.");
      });
    });

    var numUsers = 0;
    client1.on('user:joined', function(user) {
      numUsers++;

      if(numUsers ==2) {
        user.should.equal(chatUser2.name + " has joined.");
        client1.disconnect();
        done();
      }
    });

  });

});

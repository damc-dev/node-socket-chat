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

describe("Chat Server",function() {
    it('should broadcast new user to all users', function(done) {

        var client1 = io.connect(socketURL, options);

        client1.on('connect', function(data){
          client1.emit('user:connected', chatUser1);

          var client2 = io.connect(socketURL, options);
          client2.on('connect',function(data) {
            client2.emit('user:connected', chatUser2);
          });

          client2.on('user:joined', function(user) {
            user.name.should.equal(chatUser2.name);
            client2.disconnect();
          });
        });

        var numUsers = 0;
        client1.on('user:joined', function(user) {
          numUsers++;

          if(numUsers ==2) {
            user.name.should.equal(chatUser2.name);
            client1.disconnect();
            done();
          }
        });
    });
    
    it('message envelope should contain user name', function(done) {
        var client1, client2;
        var message = 'Hello World!';
        client1 = io.connect(socketURL, options);
        client1.on('connect', function(data) {
            client1.emit('user:connected', chatUser1);

            client1.on('message', function(envelope) {
                envelope.userName.should.equal(chatUser2.name);
                client1.disconnect();
            });
            
            client2 = io.connect(socketURL, options);
            client2.on('connect', function(data) {
                client2.emit('user:connected', chatUser2);
                client2.send(message);    
            });
        });
        done();
    });

    it('should be able to broadcast messages', function(done) {
        var client1, client2, client3;
        var message = 'Hello World!';
        var messages = 0;

        var checkMessage = function(client) {
            client.on('message', function(envelope){
                envelope.msg.should.equal(message);
                client.disconnect();
                messages++;
                if(messages == 3) {
                    done();
                }
            });
        };
        client1 = io.connect(socketURL, options);
        checkMessage(client1);

        client1.on('connect', function(data) {
            client1.emit('user:connected', chatUser1);

            client2 = io.connect(socketURL, options);
            checkMessage(client2);

            client2.on('connect', function(data) {
                client2.emit('user:connected', chatUser2);

                client3 = io.connect(socketURL, options);
                checkMessage(client3);

                client3.on('connect', function(data) {
                    client3.emit('user:connected', chatUser3);
                    client2.send(message);
                });
            });
        });
    });
});

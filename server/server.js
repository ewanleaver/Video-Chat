var WebSocketServer = require('ws').Server;

var server = new WebSocketServer({port: 8080});

server.broadcast = function(data) {
  for(var i in this.clients) {
    this.clients[i].send(data);
  }
};

server.on('connection', function(socket) {
  socket.on('message', function(msg) {
    console.log('received: %s', msg);
    server.broadcast(msg);
  });
});

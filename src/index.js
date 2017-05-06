var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);

server.listen(8080);

app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

app.get('/', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});


function PlayerInfo(id, name, x, y, walkVelocity) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.walkVelocity = walkVelocity;
}

var currentUsers = [];

io.on('connection', function (socket) {
  console.log('New Connection');
  socket.emit('welcome', {
    motd: "Welcome to the first multiplayer beta!"
  });

  socket.on('player join', function (data) {
    if (data == undefined) {
      socket.emit('error', { message: 'Data undefined' });
      return;
    }
    if (data.name == undefined) {
      socket.emit('error', { message: 'Name not entered' });
    } else {
      socket.player = new PlayerInfo(socket.id, data.name, 0, 0, 0);

      socket.emit('join success', {
        player: socket.player,
        otherPlayers: currentUsers
      });

      socket.broadcast.emit('player join', { player: socket.player });

      currentUsers.push(socket.player);

      socket.on('disconnect', function () {

        var index = currentUsers.indexOf(socket.player);
        if (index != -1) {
          socket.emit('player leave', {
            playerId: currentUsers[index].id
          });

          currentUsers.splice(0, index);
        }
      });

      socket.on('move player', function (data) {
          console.log("Got player move:", data);

          socket.player.x = data.x;
          socket.player.y = data.y;

          socket.broadcast.emit('move player', {
            playerId: socket.player.id,
            x: socket.player.x,
            y: socket.player.y
          });
      });
      socket.on('set walk velocity', function (data) {
          console.log('Set player walk velocity:', data);

          socket.player.walkVelocity = data.walkVelocity;

          socket.broadcast.emit('set walk velocity', {
              playerId: socket.player.id,
              name: socket.player.name,
              walkVelocity: data.walkVelocity
          });
      });
    }
  });
});
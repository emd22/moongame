var express = require('express');
var app = express();
var path = require('path');
var server = require('http').Server(app);
var io = require('socket.io')(server);
var mongoose = require('mongoose');
var Message = require('./models/message.js').Message;

mongoose.connect('mongodb://localhost/moongame');

server.listen(8080);

app.use('/js', express.static(path.join(__dirname, 'public/js')));
app.use('/css', express.static(path.join(__dirname, 'public/css')));
app.use('/img', express.static(path.join(__dirname, 'public/img')));

app.get('/', function(req, res) {
  res.sendfile(__dirname + '/main/index.html');
});

app.get('/about', function (req, res) {
  res.sendfile(__dirname + '/about/index.html');
});

app.get('/game', function (req, res) {
  res.sendfile(__dirname + '/public/index.html');
});

function PlayerInfo(id, name, x, y, walkVelocity, gravityVelocity) {
    this.id = id;
    this.name = name;
    this.x = x;
    this.y = y;
    this.walkVelocity = walkVelocity;
    this.gravityVelocity = gravityVelocity;
}

var currentUsers = [];

io.on('connection', function (socket) {
  console.log('New Connection');

  socket.on('player join', function (data) {
    if (data == undefined) {
      socket.emit('error', { message: 'Data undefined' });
      return;
    }
    if (data.name == undefined) {
      socket.emit('error', { message: 'Name not entered' });
    } else {
      socket.player = new PlayerInfo(socket.id, data.name, 0, 0, 0, 0);

      Message.find({}).then(function (messages) {
        socket.emit('join success', {
          player: socket.player,
          otherPlayers: currentUsers,
          messages: messages
        });

      }).catch(function (err) {
        console.error("ERROR LOADING MESSAGES ", err);
      });
      socket.broadcast.emit('player join', { player: socket.player });

      currentUsers.push(socket.player);

      socket.on('disconnect', function () {
        console.log("player "+socket.player+" has disconnected");

        for (var i = 0; i < currentUsers.length; i++) {
          if (currentUsers[i].id == socket.id) {
            currentUsers.splice(i, 1);
          }
        }

        socket.broadcast.emit('player leave', {
          playerId: socket.id
        });
      });

      socket.on('player send message', function (data) {
        io.sockets.emit('message sent', {
          playerId: socket.id,
          message: data.message
        });
        new Message({
          message: data.message,
          sender: data.sender
        }).save().then(function(message) {
          console.log("MESSAGE SAVE SUCCESSFULLY");
        }).catch(function (err) {
          console.error("ERROR SAVING MESSAGE: ", err);
        });
      })

      socket.on('move player', function (data) {
          //console.log("Got player move:", data);

          socket.player.x = data.x;
          socket.player.y = data.y;

          socket.broadcast.emit('move player', {
            playerId: socket.player.id,
            x: socket.player.x,
            y: socket.player.y
          });
      });
      socket.on('set walk velocity', function (data) {
          //console.log('Set player walk velocity:', data);

          socket.player.walkVelocity = data.walkVelocity;

          socket.broadcast.emit('set walk velocity', {
            playerId: socket.player.id,
            name: socket.player.name,
            walkVelocity: data.walkVelocity
          });
      });
      socket.on('set gravity velocity', function (data) {
        socket.player.gravityVelocity = data.gravityVelocity;

        socket.broadcast.emit('set gravity velocity', {
          playerId: socket.player.id,
          name: socket.player.name,
          gravityVelocity: data.gravityVelocity
        })
      }) 
    }
  });
});
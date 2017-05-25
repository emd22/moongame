var expectedSize = {
    width: 1100,
    height: 580
};

function escapeHtml(string) {
    var entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };

    return String(string).replace(/[&<>"'`=\/]/g, function (s) {
        return entityMap[s];
    });
}

$(document).ready(function () {
    $('#sidebar-close').click(function () {
        $('#main-sidebar').css('width', '0px');
        //$('#main-sidebar .wrapper').hide();
    });
    $('#open-button').click(function () {
        $('#main-sidebar').css('width', '245px');
    });

    var $messageinput = $('#message-input');
    var $messages = $('#messages');

    var message = new SpeechSynthesisUtterance();

    function speak(text, player) {
        window.speechSynthesis.cancel();
        message.text = text;
        window.speechSynthesis.speak(message);
    }

    $messageinput.keypress(function (event) {
        if (event.keyCode == 13) {
            var myPlayer = players.find(function (el) {
                return el.id == myPlayerId;
            });

            socket.emit('player send message', {
                message: $(this).val(),
                sender: myPlayer.name
            });

            $messageinput.val("");
        }
    });

    function join(name) {
        $('#open-button').css('visibility', 'visible');

        socket.emit('player join', {
            name: name
        });

        socket.on('error', function (data) {
            alert('Error! ' + data.message);
        });

        socket.on('message sent', function (data) {
            var myPlayer = players.find(function (el) {
                return el.id == myPlayerId;
            });
            var player = players.find(function (el) {
                return el.id == data.playerId;
            });
            var playername = '[' + player.name + '] ';
            $('#messages').append('<h5>' + playername + escapeHtml(data.message) + '</h5>');
            speak(player.name + " said " + data.message, myPlayer);
            console.log(data);
            $messages.scrollTop($messages[0].scrollHeight);
        });

        socket.on('join success', function (data) {
            console.log('join success:', data);
            myPlayerId = data.player.id;
            console.log('myPlayerId = ', myPlayerId);

            var myPlayer = new Player(data.player.id, data.player.name, new PhysObj(data.player.x, data.player.y, 20, 128, 128));

            myPlayer.name = name;

            console.log(speechSynthesis.getVoices());

            players.push(myPlayer);

            // add other players
            data.otherPlayers.forEach(function (player) {
                players.push(new Player(player.id, player.name, new PhysObj(player.x, player.y, 20, 128, 128)));
            });

            data.messages.forEach(function (message) {
                var playername = '[' + escapeHtml(message.sender) + '] ';
                $('#messages').append('<h5>' + playername + escapeHtml(message.message) + '</h5>');
            });

            setInterval(function () {
                socket.emit('move player', {
                    x: myPlayer._x,
                    y: myPlayer._y
                });
            }, 500);

            afterJoined();
        });

        socket.on('player join', function (data) {
            var found = false;

            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.player.id) {
                    found = true;
                    break;
                }
            }

            if (!found) {
                socket.emit('message sent', {
                    message: 'Player ' + data.player.name + ' has joined',
                    playerId: data.player.id
                });
                players.push(new Player(data.player.id, data.player.name, new PhysObj(data.player.x, data.player.y, 20, 128, 128)));
            }
        });

        socket.on('player leave', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.playerId) {
                    players.splice(i, 1);
                    break;
                }
            }
        });

        socket.on('move player', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.playerId) {
                    players[i].move(data.x, data.y, false);
                    break;
                }
            }
        });

        socket.on('set walk velocity', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.playerId) {
                    players[i].setWalkVelocity(data.walkVelocity, false);
                    break;
                }
            }
        });

        socket.on('set gravity velocity', function (data) {
            for (var i = 0; i < players.length; i++) {
                if (players[i].id == data.playerId) {
                    players[i].setGravityVelocity(data.gravityVelocity, false);
                    break;
                }
            }
        });
    }

    var $nameinput = $('#name-input');
    var $enterbutton = $('#enter-button');

    $nameinput.keypress(function (event) {
        if (event.keyCode == 13) {
            join($nameinput.val());
            $('#start-page').hide();
        }
    });

    $enterbutton.click(function () {
        join($nameinput.val());
        $('#start-page').hide();
    });

    //join(Math.random().toString());

    function addVoices() {
        var voices = window.speechSynthesis.getVoices();
        for (var i = 0; i < players.length; i++) {
            players[i].voice = voices[Math.floor(Math.random() * voices.length)];
        }
    }

    function afterJoined() {
        // NOTE: we use [0] to get the native JavaScript object,
        // rather than the jQuery object.
        var $canvas = $('#main-canvas');
        var canvas = $canvas[0];
        // get 2D context for drawing on canvas.
        var context = canvas.getContext('2d');

        calcContext(context);

        $canvas.on('touchmove', function mouseState(e) {
            var touch = event.targetTouches[0];
            mX = touch.pageX;
            mY = touch.pageY;
        });

        addVoices();
        if (speechSynthesis.onvoiceschanged !== undefined) {
            speechSynthesis.onvoiceschanged = addVoices;
        }

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // set up callback here
        $(window).resize(resizeCanvas);
        resizeCanvas();

        var playerHead = new Entity("img/player_def.png", 4);
        var playerTorso = new Entity("img/player_def.png", 4);
        var playerLegs = new Entity("img/player_def.png", 4);

        var alien_blob = new Entity("img/alien_blob.png", 4);

        var platform = new Entity("img/platform.png", 1);
        var star11 = new Entity("img/star11.png", 1);

        function loadImageSlice(entity, frameIncrement, splitWidth) {
            if (frameIncrement === undefined) {
                frameIncrement = 0.2;
            }
            if (splitWidth === undefined) {
                splitWidth = 64;
            }

            var sl = splitWidth * entity.amtFrames / entity.amtFrames * (Math.floor(entity.frameNum) % entity.amtFrames);
            entity.frameNum += frameIncrement;
            entity.frameIndex = sl;
            return sl;
        }

        function fillScreen(color) {
            context.beginPath();
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = color;
            context.fill();
        }

        fillEnemys();
        fillStars();
        fillChunks(expectedSize);

        // setup a function to draw everything in your game.

        var rand = Math.floor(Math.random() * (stars.length));
        var orgSize = stars[rand].size;

        function update() {
            keypress();
        }
        
        function draw() {
            var i;
            var canvRatio = {
                x: canvas.width / expectedSize.width,
                y: canvas.height / expectedSize.height
            };

            calcCanvRatio(canvRatio);
            
            cam.offsetX = canvas.width * canvRatio.x / 2 - 400;
            cam.x = players[0]._x - (canvas.width * canvRatio.x / 2);
            cam.y = players[0]._y;

            var playerGunX = players[0]._x - (canvas.width * canvRatio.x / 2) - cam.offsetX;

            updateMobile(canvas);
            updatePhys(enemys, canvRatio);
            // clear the screen.
            fillScreen('black');

            loadImageSlice(playerHead);
            loadImageSlice(playerTorso);
            loadImageSlice(playerLegs);

            loadImageSlice(alien_blob);

            stars[rand].size += 0.1;

            for (i = 0; i < stars.length; i++) {
                var star = stars[i];

                drawSprite(star11, star.x - (cam.x * 0.3) - canvas.width / 2, star.y, 1, 0, 2 * star.size, 2 * star.size);
            }

            var canvRatioAspect = (canvRatio.x + canvRatio.y) / 2;

            var weapon = players[0].weapons[players[0].selectedWeapon];

            context.font = "18px monospace";
            context.fillStyle = "#fff";

            var currentPlayerX = canvas.width / 2 * canvRatio.x - cam.offsetX;

            fillText(players, 0, context, cam, canvRatio, "You (" + players[0].name + ")");
            drawSprite(playerHead, currentPlayerX, players[0]._y, 64, 0, 128, 128);
            drawSprite(playerTorso, currentPlayerX, players[0]._y, 64, 1, 128, 128);

            var weaponX = (((players[0]._x - cam.x) - cam.offsetX) * canvRatio.x) + cam.gunOffsetX;
            var weaponY = ((players[0]._y + 50) * canvRatio.y) + cam.gunOffsetY;

            updateBullet(players[0]);

            context.drawImage(weapon.image, 0, 0, 64, 64, weaponX, weaponY, 192 * canvRatio.y, 192 * canvRatio.y);

            drawSprite(playerLegs, currentPlayerX, players[0]._y, 64, 2, 128, 128);

            for (i = 1; i < players.length; i++) {
                fillText(players, i, context, cam, canvRatio);

                weapon = players[i].weapons[players[i].selectedWeapon];
                var offsetX = players[i]._x - cam.x - cam.offsetX;

                drawSprite(playerHead, offsetX, players[i]._y, 64, 0, 128, 128);
                drawSprite(playerTorso, offsetX, players[i]._y, 64, 1, 128, 128);

                weaponX = ((players[i]._x - cam.x - cam.offsetX) * canvRatio.x - canvRatio.y) + cam.gunOffsetX;
                weaponY = ((players[i]._y + 50) * canvRatio.y) + cam.gunOffsetY;

                context.drawImage(weapon.image, 0, 0, 64, 64, weaponX, weaponY, 192 * canvRatio.y, 192 * canvRatio.y);

                drawSprite(playerLegs, offsetX, players[i]._y, 64, 2, 128, 128);
            }

            for (i = 0; i < chunks.length; i++) {
                var chunk = chunks[i];
                context.drawImage(platform.image, platform.frameIndex, 0, 64, 10, (chunk.x - cam.x - cam.offsetX) * canvRatio.x, chunk.y * canvRatio.y, 128 * canvRatio.x, 16 * canvRatio.y);
            }

            // for (var i = 0; i < enemys.length; i++) {
            //     drawSprite(alien_blob, canvRatio, enemys[i]._x - cam.x, enemys[i]._y, 64, 0, 128*3, 128*3, "Enemy");
            // }

            if (Math.floor(stars[rand].size) != 1) {
                stars[rand].size = orgSize;
                rand = Math.floor(Math.random() * (stars.length));
                orgSize = stars[rand].size;
            }
        }

        function game() {
            update();
            draw();
            // TODO: call the two main functions in here.
        }

        setInterval(game, 30);

        $(window).resize(draw);
    }
});
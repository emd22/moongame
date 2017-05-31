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
            $('#messages').append('<h5>' + escapeHtml(playername) + escapeHtml(data.message) + '</h5>');
            speak(player.name + " said " + data.message, myPlayer);
            console.log(data);
            $messages.scrollTop($messages[0].scrollHeight);
        });

        socket.on('join success', function (data) {
            console.log('join success:', data);
            myPlayerId = data.player.id;
            console.log('myPlayerId = ', myPlayerId);

            var myPlayer = new Player(data.player.id, data.player.name, new PhysObj(data.player.x, data.player.y, 22, 128, 128));

            myPlayer.name = name;

            console.log(speechSynthesis.getVoices());

            players.push(myPlayer);

            // add other players
            data.otherPlayers.forEach(function (player) {
                var newPlayer = new Player(player.id, player.name, new PhysObj(player.x, player.y, 20, 128, 128));
                for (var i = 0; i < player.weapons.length; i++) {
                    var weaponObj = weapons[Object.keys(weapons).find(function (key) {
                        return weapons[key].name == player.weapons[i];
                    })];
                    console.log(weaponObj);
                    if (weaponObj) {
                        newPlayer.weapons.push(weaponObj);
                        newPlayer.selectedWeapon = newPlayer.weapons.length-1;
                    }
                }
                //newPlayer.weapons.unshift(weapons.none);
                console.log(player);
                players.push(newPlayer);
            });

            console.log(data.otherPlayers);

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
                var player = new Player(data.player.id, data.player.name, new PhysObj(data.player.x, data.player.y, 20, 128, 128));
                players.push(player);
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

        socket.on('player update weapon', function (data) {
            var player = players.find(function (el) {
                return el.id == data.playerId;
            });

            var weaponObj = weapons[Object.keys(weapons).find(function (key) {
                return weapons[key].name == data.weaponName;
            })];

            if (weaponObj) {
                player.weapons.push(weaponObj);
            }
            
            console.log(player.weapons);
            player.selectedWeapon++;

            console.log(player.weapons);

            itemEnts.splice(data.itemToRemove, 1);
        });

        socket.on('player shoots', function (data) {
            var player = players.find(function (el) {
                return el.id == data.playerId;
            });
            shootWeapon(player);
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

        var box = new Entity("img/box.png", 0);
        var boxPhys = new PhysObj(300, canvas.height-500, 20, 32, 32, false);
        physicsObjects.push(boxPhys);

        var alien_blob = new Entity("img/alien_blob.png", 4);

        var platform = new Entity("img/platform.png", 1);
        var star11 = new Entity("img/star11.png", 1);

        function fillScreen(color) {
            context.beginPath();
            context.rect(0, 0, canvas.width, canvas.height);
            context.fillStyle = color;
            context.fill();
        }

        fillEnemys();
        fillStars();
        fillChunks(expectedSize);

        newWeaponItem(weapons.autorpg, canvas);

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
            var y = players[0]._y;
            var flipped = players[0].flipped;
            
            fillText(players, 0, context, cam, canvRatio, "You (" + players[0].name + ")");
            drawPlayer(playerHead, currentPlayerX, y, 0);
            drawPlayer(playerTorso, currentPlayerX, y, 1);

            var weaponX = (((players[0]._x - cam.x + weapon.camOffsetX) - cam.offsetX) * canvRatio.x) + cam.gunOffsetX;
            var weaponY = ((players[0]._y + weapon.camOffsetY) * canvRatio.y) + cam.gunOffsetY;

            context.drawImage(weapon.image, weapon.frameIndex, 0, 64, 64, weaponX, weaponY, weapon.w * canvRatio.y, weapon.h * canvRatio.y);

            drawPlayer(playerLegs, currentPlayerX, y, 2);

            itemsCollision(players[0]);            

            updateBullet(players[0]);

            for (var j = 0; j < players[0].bulletObjs.length; j++) {
                var bulletObj = players[0].bulletObjs[j];
                drawSprite(bulletObj.image, bulletObj.ammoX, bulletObj.ammoY, 32, 0, 64, 64);
            }

            for (i = 1; i < players.length; i++) {
                flipped = players[i].flipped;

                fillText(players, i, context, cam, canvRatio);

                weapon = players[i].weapons[players[i].selectedWeapon];
                var offsetX = players[i]._x - cam.x - cam.offsetX;
                y = players[i]._y;

                drawPlayer(playerHead, offsetX, y, 0);
                drawPlayer(playerTorso, offsetX, y, 1);

                weaponX = ((players[i]._x - cam.x - cam.offsetX + weapon.camOffsetX) * canvRatio.x - canvRatio.y) + cam.gunOffsetX;
                weaponY = ((players[i]._y + weapon.camOffsetY) * canvRatio.y) + cam.gunOffsetY;

                context.drawImage(weapon.image, 0, 0, 64, 64, weaponX, weaponY, weapon.w * canvRatio.y, weapon.h * canvRatio.y);

                drawPlayer(playerLegs, offsetX, y, 2);                

                updateBullet(players[i]);

                for (j = 0; j < players[i].bulletObjs.length; j++) {
                    var bulletObj = players[i].bulletObjs[j];
                    drawSprite(bulletObj.image, bulletObj.ammoX, bulletObj.ammoY, 32, 0, 64, 64);
                }
            }

            drawItems();
            drawObject(box, boxPhys, 32, 0);

            entGravity(boxPhys, canvRatio);

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
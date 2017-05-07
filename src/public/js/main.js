var expectedSize = {
    width: 1100,
    height: 580
};

$(document).ready(function () {
    function join(name) {
        socket.emit('player join', {
            name: name
        });

        socket.on('error', function (data) {
            alert('Error! ' + data.message);
        });

        socket.on('join success', function (data) {
            console.log('join success:', data);
            myPlayerId = data.player.id;
            console.log('myPlayerId = ', myPlayerId);

            var myPlayer = new Player(data.player.id, new PhysObj(data.player.x, data.player.y, 20, 128, 128))

            players.push(myPlayer);

            // add other players
            data.otherPlayers.forEach(function (player) {
                players.push(new Player(player.id, new PhysObj(player.x, player.y, 20, 128, 128)));
            });

            setInterval(function() {
                socket.emit('move player', {
                    x: myPlayer._x,
                    y: myPlayer._y
                })
            }, 500)

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
                players.push(new Player(data.player.id, new PhysObj(data.player.x, data.player.y, 20, 128, 128)));
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
    }

    join(Math.random().toString());

    function afterJoined() {
        // NOTE: we use [0] to get the native JavaScript object,
        // rather than the jQuery object.
        var canvas = $('#main-canvas')[0];
        // get 2D context for drawing on canvas.
        var context = canvas.getContext('2d');

        canvas.addEventListener("mousedown", getPosition, false);

        function resizeCanvas() {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // set up callback here
        $(window).resize(resizeCanvas);
        resizeCanvas();

        function Entity(imageSrc, amtFrames) {
            this.image = new Image();
            this.image.src = imageSrc;
            this.frameNum = 0;
            this.frameIndex = 0;
            this.amtFrames = amtFrames;
        }

        function Star(x, y) {
            this.x = x;
            this.y = y;
            this.size = 1;
            this.image;
        }

        var stars = [];
        var chunks = [];

        var player = new Entity("img/player_def.png", 4);

        var platform = new Entity("img/platform.png", 1);
        var star11 = new Entity("img/star11.png", 1);
        var button = new Entity("img/button.png", 1);

        function loadImageSlice(entity, frameIncrement, splitWidth) {
            if (frameIncrement == undefined) {
                frameIncrement = 0.2;
            }
            if (splitWidth == undefined) {
                splitWidth = 64;
            }
            context.mozImageSmoothingEnabled = false;
            context.webkitImageSmoothingEnabled = false;
            context.msImageSmoothingEnabled = false;
            context.imageSmoothingEnabled = false;

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

        function fillChunks() {
            for (var i = 0; i < 8; i++) {
                var chunk = new PhysObj();
                chunk.x = i * 128;
                chunk.y = expectedSize.height-10;
                chunk.width = 64;
                chunk.height = 10;
                physicsObjects.push(chunk);
                chunks.push(chunk);
            }
        }
        function fillStars() {
            for (var i = 0; i < 500; i++) {
                var star = new Star();
                var rand = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
                star.size = rand;
                star.x = Math.floor(Math.random() * (expectedSize.width + 1));
                star.y = Math.floor(Math.random() * (expectedSize.height + 1));
                stars.push(star);
            }
        }

        fillStars();
        fillChunks();

        // setup a function to draw everything in your game.

        var rand = Math.floor(Math.random() * (stars.length));
        var orgSize = stars[rand].size;

        function update() {
            keypress();
        }

        var isMobile;

        function checkMobile() {
            if ($(window).width() <= 766) {
                isMobile = true;
            }
            else {
                isMobile = false;
            }
        }

        checkMobile();

        function getPosition(event) {
            var mX = event.x;
            var mY = event.y;

            mX -= canvas.offsetLeft;
            mY -= canvas.offsetTop;

            return [mX, mY];
        }

        function updateMobile() {
            if (isMobile) {
                console.log("running mobile...")
                if (mX < 100 + 128 &&
                    mX + 1 > 128 &&
                    mY < 100 + 128 &&
                    1 + mY > 100) {

                    player.move(oldx+1, oldy-7, true);
                }
                context.drawImage(button.image, 0, 0, 64, 64, 100, 100, 128, 128);
                context.drawImage(button.image, 0, 0, 64, 64, 500, 100, 128, 128);
            }
        }

        function draw() {
            updateMobile();

            var canvRatio = {
                x: canvas.width / expectedSize.width,
                y: canvas.height / expectedSize.height
            };

            updatePhys(canvRatio);
            // clear the screen.
            fillScreen('black');

            loadImageSlice(player);

            stars[rand].size += 0.08;

            for (var i = 0; i < stars.length; i++) {
                var star = stars[i];

                context.drawImage(star11.image, star11.frameIndex, 0, 1, 1, star.x * canvRatio.x, star.y * canvRatio.y, 2 * star.size, 2 * star.size);
            }

            var canvRatioAspect = (canvRatio.x + canvRatio.y) / 2;
            
            for (var i = 0; i < players.length; i++) {
                context.drawImage(player.image, player.frameIndex, 0, 64, 64, players[i]._x * canvRatio.x, players[i]._y * canvRatio.y, 128 * canvRatio.y, 128 * canvRatio.y);
            }

            for (var i = 0; i < chunks.length; i++) {
                var chunk = chunks[i];
                context.drawImage(platform.image, platform.frameIndex, 0, 64, 10, chunk.x * canvRatio.x, chunk.y * canvRatio.y, 128 * canvRatio.x, 16 * canvRatio.y);
            }

            if (Math.floor(stars[rand].size) != 1) {
                stars[rand].size  = orgSize;
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
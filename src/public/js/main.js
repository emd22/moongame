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

        var isMobile = false;

        function checkMobile() {
            (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4))) isMobile = true;})(navigator.userAgent||navigator.vendor||window.opera);
            console.log(isMobile);
        };

        checkMobile();

        var mX = 0;
        var mY = 0;

        function getPosition(event) {
            mX = event.x;
            mY = event.y;

            mX -= canvas.offsetLeft;
            mY -= canvas.offsetTop;
        }

        function updateMobile() {
            if (isMobile) {
                console.log("running mobile...")
                if (mX < 100 + 128 &&
                    mX + 1 > 128 &&
                    mY < 100 + 128 &&
                    1 + mY > 100) {
                    
                    var myPlayer = players.find(function (el) {
                        return el.id == myPlayerId;
                    });

                    mX = 0;
                    mY = 0;

                    console.log("move via virtual buttons")
                    myPlayer.setWalkVelocity(myPlayer.walkVelocity+1, true);
                }
                context.drawImage(button.image, button.frameIndex, 0, 64, 64, 100, 100, 128, 128);
                context.drawImage(button.image, button.frameIndex, 0, 64, 64, 500, 100, 128, 128);
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

            context.font = "50px Arial";
            var message = "x:"+mX.toString+" y:"+mY.toString;
            context.fillText(message, 100, 100);

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
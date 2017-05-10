var physicsObjects = [];
var x = 0;
var y = 0;
var playerPhys = new PhysObj(x, y, 20, 128, 128);

function updatePhys(canvRatio) {
    for (var i = 0; i < players.length; i++) {
        players[i].physObj = new PhysObj(players[i]._x * canvRatio.x, players[i]._y * canvRatio.y, 20, 128, 128);

        gravity(players[i], canvRatio);
        walkPhys(players[i]);
    }
}

function PhysObj(x, y, mass, width, height, nocollide) {
    this.x = x;
    this.y = y;

    this.width = width;
    this.height = height;

    if (mass == undefined) {
        this.mass = 0;
    } else {
        this.mass = mass;
    }
}

function gravity(player, canvRatio) {
    player.jumpCooldown--;
    for (var i = 0; i < physicsObjects.length; i++) {
        var obj = physicsObjects[i];

        if (obj.nocollide) {
            return;
        }

        var objFixed = {
            x: obj.x * canvRatio.x,
            y: obj.y * canvRatio.y,
            width: obj.width,
            height: obj.height
        };

        var playerFixed = {
            x: player._x * canvRatio.x,
            y: player._y * canvRatio.y,
            width: player.physObj.width * canvRatio.x,
            height: player.physObj.height * canvRatio.y
        }

        var oldx = player._x;
        var oldy = player._y;

        if (playerFixed.x < objFixed.x + objFixed.width &&
            playerFixed.x + playerFixed.width > objFixed.x &&
            playerFixed.y < objFixed.y + objFixed.height &&
            playerFixed.height + playerFixed.y > objFixed.y) {

            player.move(oldx, oldy - 1, false);
            player.setGravityVelocity(0, false);
        }
        else {
            player.setGravityVelocity(player.gravityVelocity + 0.01, false);
        }
    }
}

document.addEventListener('keydown', function (event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();

    var myPlayer = players.find(function (el) {
        return el.id == myPlayerId;
    });

    if (key == "w") {
        //myPlayer.move(myPlayer._x, myPlayer._y - 100, true);
        if (findPowerup(myPlayer, "Jetpack") != -1) {
            myPlayer.setGravityVelocity(myPlayer.gravityVelocity - 0.5, true);
            lowerCapacity(myPlayer, "Jetpack", 15);
        }
        else {
            if (myPlayer.jumpCooldown <= 0) {
                myPlayer.jumpCooldown = 35;
                myPlayer.setGravityVelocity(myPlayer.gravityVelocity - 5.4, true);
            }
        }
    }
    else if (key == "s") {
        //myPlayer.move(myPlayer._x, myPlayer._y - 100, true);
        myPlayer.setGravityVelocity(myPlayer.gravityVelocity + 0.7, true);
    }
    if (key == "a") {
        var moveSpeed = 1;
        if (findPowerup(myPlayer, "Super Speed") != -1) {
            moveSpeed = 5;
            lowerCapacity(myPlayer, "Super Speed", 5);
        }
        if (myPlayer.walkVelocity > -5) {
            myPlayer.setWalkVelocity(myPlayer.walkVelocity - moveSpeed, true);
        }
    }
    else if (key == "d") {
        var moveSpeed = 1;
        if (findPowerup(myPlayer, "Super Speed") != -1) {
            moveSpeed = 5;
            lowerCapacity(myPlayer, "Super Speed", 5);
        }

        if (myPlayer.walkVelocity < 5) {
            myPlayer.setWalkVelocity(myPlayer.walkVelocity + moveSpeed, true);
        }
    }
});

function walkPhys(player) {
    player.move(player._x + player.walkVelocity, player._y + player.gravityVelocity, false /* do not send to server*/);
    player.walkVelocity *= 0.9;
}
var gravityThreshold = 1;
var physicsObjects = [];
var x = 0;
var y = 0;
var playerPhys = new PhysObj(x, y, 20, 128, 128);

function updatePhys(canvRatio) {
    //playerPhys = new PhysObj(x, y, 20, 128, 128);
    for (var i = 0; i < players.length; i++) {
        players[i].physObj = new PhysObj(players[i]._x * canvRatio.x, players[i]._y * canvRatio.y, 20, 128, 128);

        gravity(players[i], canvRatio);
        walkPhys(players[i]);
    }
    
    // var myPlayer = players.find(function (el) {
    //     return el.id == myPlayerId;
    // });
    
    // gravity(myPlayer, canvRatio);
    // walkPhys(myPlayer);

    

    // gravity();
    // walkPhys();
}

function PhysObj(x, y, mass, width, height) {
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
    for (var i = 0; i < physicsObjects.length; i++) {
        var obj = physicsObjects[i];

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

            //y = oldy - 7;
            //x = oldx;
            player.move(oldx, oldy-7, false);
        }
        else {
            //y++;
            player.move(player._x, player._y + 1, false);
        }
    }
}

//var walkVelocity = 0;
//var jumpVelocity = 0;
//var keyCount = 0;

function moveL() {
    if (myPlayer.walkVelocity > -5) {
        // myPlayer.walkVelocity -= 1;
        myPlayer.setWalkVelocity(myPlayer.walkVelocity-1, true);
    }
}
function moveR() {
    if (myPlayer.walkVelocity < 5) {
        // myPlayer.walkVelocity += 1;
        myPlayer.setWalkVelocity(myPlayer.walkVelocity+1, true);
    }
}

document.addEventListener('keydown', function (event) {
    var key = String.fromCharCode(event.keyCode).toLowerCase();

    // lets just pretend that players[0] is OUR player for now
    var myPlayer = players.find(function (el) {
        return el.id == myPlayerId;
    });

    //console.log('key = ', key);
    if (key == "w") {
        // y -= 100;
        myPlayer.move(myPlayer._x, myPlayer._y - 100, true);
    }
    if (key == "a") {
        // if (walkVelocity > -5) {
        //     walkVelocity--;
        // }

        moveL();

        key = 0;
    }
    else if (key == "d") {
        // if (walkVelocity < 5) {
        //     walkVelocity++;
        // }

        moveR();
        
        key = 0;
    }
    else {
    // myPlayer.walkVelocity = 0;
        myPlayer.setWalkVelocity(0, true);
    }

});

function walkPhys(player) {
    // x += walkVelocity;
    // walkVelocity *= 0.9

    player.move(player._x + player.walkVelocity, player._y, false /* do not send to server*/);
    player.walkVelocity *= 0.9;
}
var canvRatio = {
    x: null,
    y: null
};

var context;

function calcContext(newContext) {
    context = newContext;
}

function calcCanvRatio(newCanvRatio) {
    canvRatio = newCanvRatio;
}

function fillText(players, i, context, cam, canvRatio, overrideText) {
    text = "";
    if (overrideText === undefined) { 
        text = players[i].name; 
    } else { 
        text = overrideText; 
    }
    context.fillText(text, ((players[i]._x - cam.x - cam.offsetX) * canvRatio.x - canvRatio.y), players[i]._y * canvRatio.y);
}

var stars = [];
var chunks = [];

var enemys = [];


function Star(x, y) {
    this.x = x;
    this.y = y;
    this.size = 1;
    this.image;
}

function fillChunks(expectedSize) {
    for (var i = 0; i < 8; i++) {
        var chunk = new PhysObj();
        chunk.x = i * 128;
        chunk.y = expectedSize.height - 30;
        chunk.width = 64;
        chunk.height = 64;
        chunk.type = "GroundChunk";
        physicsObjects.push(chunk);
        chunks.push(chunk);
    }
}

function fillEnemys() {
    for (var i = 0; i < 2; i++) {
        var phys = new PhysObj(200 + 128 * 3 * i, 0, 20, 10, 10, "Enemy");
        var enemy = new BasicEntity(phys);
        enemys.push(enemy);
    }
}

function fillStars() {
    for (var i = 0; i < 250; i++) {
        var star = new Star();
        var rand = Math.floor(Math.random() * (2 - 1 + 1)) + 1;
        star.size = rand;
        star.x = Math.floor(Math.random() * (expectedSize.width + starsWidth + 1));
        star.y = Math.floor(Math.random() * (expectedSize.height + 1));
        stars.push(star);
    }
}

function drawSprite(entity, x, y, cutW, yIndex, w, h) {
    context.mozImageSmoothingEnabled = false;
    context.webkitImageSmoothingEnabled = false;
    context.msImageSmoothingEnabled = false;
    context.imageSmoothingEnabled = false;

    w *= canvRatio.y;
    h *= canvRatio.y;
    
    //context.drawImage(player.image, player.frameIndex, 0, 64, 64, players[i]._x * canvRatio.x, players[i]._y * canvRatio.y, 128 * canvRatio.y, 128 * canvRatio.y);

    context.drawImage(
        entity.image,
        entity.frameIndex,
        yIndex * cutW,
        cutW,
        cutW,
        x * Math.min(canvRatio.x, 128),
        y * Math.min(canvRatio.y, 128),
        w,
        h
    );
}

function Entity(imageSrc, amtFrames, amtLines) {
    this.image = new Image();
    this.image.src = imageSrc;
    this.frameNum = 0;
    this.frameIndex = 0;
    this.amtFrames = amtFrames;
    this.amtLines = amtLines;
}

function shootGun(player) {
    var bullet = shootWeapon(player);
    socket.emit("player shoots", {
        bullet: bullet
    });
}


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

var itemEnts = [];

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
        chunk.width = 128;
        chunk.height = 64;
        chunk.lock = true;
        physicsObjects.push(chunk);
        chunks.push(chunk);
    }
}

function fillEnemys() {
    for (var i = 0; i < 2; i++) {
        var phys = new PhysObj(200 + 128 * 3 * i, 0, 21, 10, 10, "Enemy");
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

    //context.drawImage(player.image, player.frameIndex, 0, 64, 64, players[i]._x * canvRatio.x, players[i]._y * canvRatio.y, 128 * canvRatio.y, 128 * canvRatio.y);

    context.drawImage(
        entity.image,
        entity.frameIndex,
        yIndex * cutW,
        cutW,
        cutW,
        x * canvRatio.x,
        y * canvRatio.y,
        w,
        h
    );
}

function drawPlayer(rEnt, x, y, level) {
    drawSprite(rEnt, x, y, 64, level, 128, 128);
}

function newWeaponItem(weapon, canvas) {
    var weaponEnt = new Entity(weapon.image.src, 0, 0);
    var weaponPhys = new PhysObj(500, canvas.height - 140, 20, 128, 128, false);

    itemEnts.push([weaponEnt, weaponPhys, weapon]);
}

function drawItems() {
    for (var i = 0; i < itemEnts.length; i++) {
        var cur = itemEnts[i];
        var ent = cur[0];
        var phys = cur[1];

        context.fillText(cur[2].name, ((phys.x - cam.x - cam.offsetX + 30) * canvRatio.x - canvRatio.y), phys.y * canvRatio.y - 10);
        drawObject(ent, phys, 64, 0);
    }
}

function itemsCollision(player) {
    for (var i = 0; i < itemEnts.length; i++) {
        var cur = itemEnts[i];
        var phys = cur[1];

        var collision1 = collision(phys, player, canvRatio);

        if (collision1 == 1) {

            player.weapons.push(cur[2]);
            player.selectedWeapon++;

            socket.emit('player update weapon', {
                weaponName: cur[2].name,
                itemToRemove: i,
            });

            itemEnts.splice(i, 1);
        }
    }
}

function loadImageSlice(entity, frameIncrement, splitWidth, forceFrame) {
    if (forceFrame !== undefined) {
        if (forceFrame > entity.amtFrames) {
            return 0;
        }
        entity.frameIndex = splitWidth * forceFrame;
        return splitWidth * forceFrame;
    }

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

function Entity(imageSrc, amtFrames, amtLines) {
    this.image = new Image();
    this.image.src = imageSrc;
    this.frameNum = 0;
    this.frameIndex = 0;
    this.amtFrames = amtFrames;
    this.amtLines = amtLines;
}

function drawObject(ent, phys, cutW, yIndex) {
    drawSprite(ent, phys.x - cam.x - cam.offsetX, phys.y, cutW, yIndex, phys.width, phys.height);
}

function shootGun(player) {
    var bullet = shootWeapon(player);
    socket.emit("player shoots", {
        bullet: bullet
    });
}


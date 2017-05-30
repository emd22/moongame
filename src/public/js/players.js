function Player(id, name, physObj) {
    this.id = id;
    this.name  = name;
    this.physObj = physObj;

    this.powerups = [];
    this.bulletObjs = [];
    this.weapons = [weapons.none];
    this.selectedWeapon = 0;

    this.flipped = false;
    this._x = physObj.x;
    this._y = physObj.y;
    this.walkVelocity = 0;
    this.gravityVelocity = 0;
    this.jumpCooldown = 0;
}

function BasicEntity(physObj) {
    this.physObj = physObj;

    this.powerups = [];

    this._x = physObj.x;
    this._y = physObj.y;
    this.walkVelocity = 0;
    this.gravityVelocity = 0;
    this.jumpCooldown = 0;
}

BasicEntity.prototype.move = function (x, y, sendToServer) {
    this._x = x;
    this._y = y;

    if (sendToServer) {
        socket.emit('move player', {
            x: this._x,
            y: this._y
        });
    }
};

BasicEntity.prototype.setWalkVelocity = function (newWalkVelocity, sendToServer) {
    this.walkVelocity = newWalkVelocity;

    if (sendToServer) {
        socket.emit('set walk velocity', {
            walkVelocity: newWalkVelocity
        });
    }
};

BasicEntity.prototype.setGravityVelocity = function (newGravityVelocity, sendToServer) {
    this.gravityVelocity = newGravityVelocity;

    if (sendToServer) {
        socket.emit('set gravity velocity', {
            gravityVelocity: newGravityVelocity
        });
    }
};

BasicEntity.prototype.walkPhys = function (sendToServer) {
    this._x += this.walkVelocity;
    this.walkVelocity *= 0.9;
};


Player.prototype.move = function (x, y, sendToServer) {
    this._x = x;
    this._y = y;

    if (sendToServer) {
        socket.emit('move player', {
            x: this._x,
            y: this._y
        });
    }
};

Player.prototype.setWalkVelocity = function (newWalkVelocity, sendToServer) {
    this.walkVelocity = newWalkVelocity;

    if (sendToServer) {
        socket.emit('set walk velocity', {
            walkVelocity: newWalkVelocity
        });
    }
};

Player.prototype.setGravityVelocity = function (newGravityVelocity, sendToServer) {
    this.gravityVelocity = newGravityVelocity;

    if (sendToServer) {
        socket.emit('set gravity velocity', {
            gravityVelocity: newGravityVelocity
        });
    }
};

Player.prototype.walkPhys = function (sendToServer) {
    this._x += this.walkVelocity;
    this.walkVelocity *= 0.9;
};

var myPlayerId;

var players = [];
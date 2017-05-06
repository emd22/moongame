function Player(id, physObj) {
    this.id = id;
    this.physObj = physObj;

    this._x = physObj.x;
    this._y = physObj.y;
    this.walkVelocity = 0;
}

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
}

Player.prototype.walkPhys = function (sendToServer) {
    this._x += this.walkVelocity;
    this.walkVelocity *= 0.9;
};

var myPlayerId;

var players = [
    
];
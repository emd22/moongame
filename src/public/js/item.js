var jetpack = new Powerup("Jetpack", 1500);

function findPowerup(player, type) {
    for (var i = 0; i < player.powerups.length; i++) {
        if (player.powerups[i].type == type) {
            return i;
        }
    }
    return -1;
}

function Powerup(type, duration) {
    this.type = type;
    this.duration = duration;
}
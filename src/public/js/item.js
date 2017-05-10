var jetpack = new Powerup("Jetpack", 1500);
var superspeed = new Powerup("Super Speed", 2000)

function lowerCapacity(player, type, amt) {
    var powerIndex = findPowerup(player, type);
    console.log(player.powerups[powerIndex].duration);
    if (powerIndex != -1) {
        if (player.powerups[powerIndex].duration <= 0) {
            removePowerup(player, type);
            return 0;
        }
        player.powerups[powerIndex].duration -= amt;
        return player.powerups[powerIndex].duration;
    }
}

function removePowerup(player, type) {
    var powerIndex = findPowerup(player, type);
    if (powerIndex != -1) {
        player.powerups.splice(powerIndex, 1);
    }
}

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
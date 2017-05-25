var jetpack = new Powerup("Jetpack", 2500);
var superspeed = new Powerup("Super Speed", 2000);

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

var weaponList = [
    new Weapon(new WeaponProps(0, 0, 0), new Ammo("ammo.png", 0), "None", "none.png", 0),
    new Weapon(new WeaponProps(10, 8, 50), new Ammo("ammo.png", 10000), "SG108", "shotgun.png", 100)
];

var weapon_none = weaponList[0];
var weapon_sg108 = weaponList[1];

function WeaponProps(damage, magSize, bulletSpeed) {
    this.damage = damage;
    this.magSize = magSize;
    this.bulletSpeed = bulletSpeed;
}

function Weapon(weaponProps, newAmmo, name, imageSrc, ammo) {
    this.weaponProps = weaponProps;
    this.newAmmo = newAmmo;
    this.name = name;
    this.image = new Image();
    this.image.src = "img/weapons/" + imageSrc;
    this.ammo = ammo;
}

function Ammo(imageSrc, range, ammoX, ammoY) {
    this.ammoX = ammoX;
    this.ammoY = ammoY;
    this.image = new Entity("img/weapons/ammo.png", 0, 0);
    this.range = range;
}

function findWeapon(name, player) {
    for (var i = 0; i < player.weapons.length; i++) {
        if (player.weapons[i].name == name) {
            return i;
        }
    }
    return -1;
}

function updateBullet(player) {
    var currentWeapon = player.weapons[player.selectedWeapon];

    for (var i = 0; i < player.bulletObjs.length; i++) {
        var bulletObj = player.bulletObjs[i];
        bulletObj.ammoX += currentWeapon.weaponProps.bulletSpeed;
        if (bulletObj.ammoX >= bulletObj.range) {
            player.bulletObjs.splice(i, 1);
        }
    }
}

function shootWeapon(player) {
    var currentWeapon = player.weapons[player.selectedWeapon];

    var bulletX = player._x - cam.x - cam.offsetX;
    var bulletY = ((player._y + 15) * canvRatio.y) + cam.gunOffsetY;

    if (currentWeapon.ammo <= 0) {
        return;
    }

    var bullet = new Ammo(currentWeapon.newAmmo.image, currentWeapon.newAmmo.range, bulletX, bulletY);

    console.log(player.name, "shot");
    player.bulletObjs.push(bullet);

    return bullet;
}
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

var weapons = {
    none: new Weapon(new WeaponProps(0, 0, 100, 0), new Ammo("none.png", 100), "None", "none.png", 100, 0, 0, 0, 192, 192),
    sg108: new Weapon(new WeaponProps(10, 8, 50, 50), new Ammo("ammo.png", 10000), "SG108", "shotgun.png", 100, -50, -35, 0, 192, 192),
    sg812: new Weapon(new WeaponProps(8, 12, 70, 50), new Ammo("ammo.png", 5000), "SG812", "shotgun.png", 100, -50, -35, 0, 192, 192),
    rpg: new Weapon(new WeaponProps(100, 4, 40, 75), new Ammo("rocket.png", 20000), "Rocket Launcher", "rpg.png", 100, -30, 0, 1, 128, 128),
    autorpg: new Weapon(new WeaponProps(100, 4, 40, 1), new Ammo("rocket.png", 20000), "Automatic Rocket Launcher", "rpg.png", 100, -30, 0, 1, 128, 128)
};

function WeaponProps(damage, magSize, bulletSpeed, cooldown) {
    this.damage = damage;
    this.magSize = magSize;
    this.bulletSpeed = bulletSpeed;
    this.cooldown = -cooldown;
}

function Weapon(weaponProps, newAmmo, name, imageSrc, ammo, camOffsetX, camOffsetY, amtFrames, w, h) {
    this.weaponProps = weaponProps;
    this.newAmmo = newAmmo;
    this.name = name;
    this.image = new Image();
    this.image.src = "img/weapons/" + imageSrc;
    this.ammo = ammo;
    this.shootCooldown = 0;

    this.amtFrames = amtFrames;
    this.frameNum = 0;
    this.frameIndex = 0;

    this.itemToRemove = -1;

    this.w = w;
    this.h = h;

    this.camOffsetX = camOffsetX;
    this.camOffsetY = camOffsetY;
}

function Ammo(imageSrc, range, ammoX, ammoY) {
    if (ammoX === undefined) {
        ammoX = 0;
    }
    if (ammoY === undefined) {
        ammoY = 0;
    }

    this.ammoX = ammoX;
    this.ammoY = ammoY;
    this.image = new Entity("img/weapons/" + imageSrc, 0, 0);
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

    currentWeapon.shootCooldown++;

    if (currentWeapon.shootCooldown === 0) {
        loadImageSlice(currentWeapon, undefined, 64, 0);
    }

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
    //loadImageSlice(currentWeapon, 1);

    if (currentWeapon.shootCooldown >= 0) {
        loadImageSlice(currentWeapon, undefined, 64, 1);
        //loadImageSlice(currentWeapon, 1);
        var bulletX = player._x - cam.x - cam.offsetX;
        var bulletY = ((player._y + 15) * canvRatio.y) + cam.gunOffsetY;

        if (currentWeapon.ammo <= 0) {
            return;
        }

        var ammoImg = String(currentWeapon.newAmmo.image.image.src);
        var newAmmoImg = ammoImg.split('/').pop();

        var bullet = new Ammo(newAmmoImg, currentWeapon.newAmmo.range, bulletX, bulletY);

        player.bulletObjs.push(bullet);
        
        currentWeapon.shootCooldown = currentWeapon.weaponProps.cooldown;    

        return bullet;

    }
}
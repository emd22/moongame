var fs = require('fs'),
    PNG = require('pngjs').PNG;

var mapImg = "maps/map0.png";

function Obj(type, x, y) {
    this.type = type;
    this.x = x;
    this.y = y;
    this.width = 1;
}

function findItem(dat, idx, r, g, b, obj, useStreak) {
    var streak = 0;

    if (useStreak) {
        for (var i = 0; compareRGB(dat, idx + (streak * 4), r, g, b); i++) { //read through all similar pixels in the x axis
            streak++;
        }
    }

    console.log("found " + obj.type + " x=" + obj.x + ", y=" + obj.y + ", width=" + streak);
    obj.width = streak;
    return [obj, streak]; //return width to move the x position
}

function compareRGB(dat, idx, r, g, b) {
    if (r == dat[idx] && g == dat[idx + 1] && b == dat[idx + 2]) {
        return true;
    }
    return false;
}

function loadChunk(path, callback) {
    fs.exists(path, function (exists) {
        if (exists) {
            fs.createReadStream(path)
                .pipe(new PNG({
                    filterType: 4
                }))
                .on('parsed', function () {
                    var objects = [];

                    for (var y = 0; y < this.height; y++) {
                        for (var x = 0; x < this.width; x++) {
                            var idx = (this.width * y + x) << 2;
                            var dat = this.data;

                            var item = [0, 0];

                            if (compareRGB(dat, idx, 255, 255, 255)) {
                                item = findItem(dat, idx, 255, 255, 255, new Obj("Platform", x, y), true);
                                objects.push(item[0]);
                            } else if (compareRGB(dat, idx, 255, 255, 0)) {
                                item = findItem(dat, idx, 255, 255, 0, new Obj("Item", x, y), false);
                                objects.push(item[0]);
                            }
                            x += item[1];
                        }
                    }
                    callback(objects);
                });
        } else {
            callback(null);
        }
    });
}

module.exports = loadChunk;
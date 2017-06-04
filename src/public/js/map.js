var chunks = [];

function Chunk(phys, x) {
    this.phys = phys;
    this.x = x;
}

function newPlatform(x, y, width) {
    console.log(y);
    var phys = new PhysObj(x, expectedSize.height-y, 20, 128*width, 64, true);

    for (var i = 0; i < width; i++) {
        physicsObjects.push(phys);
        chunks.push(new Chunk(phys, x+i*128));
    }
}

function generateChunks(info) {
    for (var i = 0; i < info.length; i++) {
        var newInfo = info[i];
        if (newInfo.type == "Platform") {
            newPlatform(newInfo.x, newInfo.y, newInfo.width);
        }
    }
}

function setupChunk(chunkX, chunkY) {
    $.get('/api/chunk/'+chunkX+'/'+chunkY).done(function (resp) {
        console.log("loaded");
        console.log(resp);
        generateChunks(resp);
    });
}
setupChunk(0, 0);
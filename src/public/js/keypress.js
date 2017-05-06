var key = "";

function keypress() {
    document.onkeypress = function (e) {
        e = e || window.event;
        key = String.fromCharCode(e.keyCode);
    };
}
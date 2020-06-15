let socket = new WebSocket("wss://iqoption.com/echo/websocket");
let canvas = null;
let ctx = null;

socket.onopen = async function (e) {
    console.log("[open] Connection established");
    socket.send(JSON.stringify({ "name": "setOptions", "request_id": "-1", "msg": { "sendResults": true } }));
    socket.send(JSON.stringify({ "name": "ssid", "request_id": "786", "msg": "0404bec7527874cb0149d8ecca5b9b12" }));
    setTimeout(async function () {
        socket.send(JSON.stringify({ "name": "subscribeMessage", "request_id": "eur_10", "msg": { "name": "candle-generated", "params": { "routingFilters": { "active_id": "1", "size": "10" } } } }));
    }, 500);
};

socket.onmessage = async function (event) {
    var incomingMessage = JSON.parse(event.data);
    if (incomingMessage.name == "candle-generated") {
        var close = JSON.stringify(incomingMessage.msg.close);
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.fillText(close, 10, 50);
    }
};

socket.onclose = async function (event) {
    if (event.wasClean) {
        console.log(`[close] Connection closed cleanly, code=${event.code} reason=${event.reason}`);
    } else {
        // e.g. server process killed or network down
        // event.code is usually 1006 in this case
        console.log('[close] Connection died');
    }
};

socket.onerror = async function (error) {
    console.log(`[error] ${error.message}`);
};

self.addEventListener('message', function (e) {
    canvas = e.data.canvas;
    ctx = canvas.getContext("2d");
    ctx.font = "30px Arial";

}, false);
window.onload = () => {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js');
    }
}

var currencyList =
    {
        'EURUSD': { id: 1, from: 'EUR', to: 'USD', interval: [10] },
        'EURGBP': { id: 2, from: 'EUR', to: 'GBP', interval: [10] },
        'GBPUSD': { id: 5, from: 'GBP', to: 'USD', interval: [10] },
        'USDJPY': { id: 6, from: 'USD', to: 'JPY', interval: [10] },
        'NZDUSD': { id: 8, from: 'NZD', to: 'USD', interval: [10] },
        'USDCHF': { id: 72, from: 'USD', to: 'CHF', interval: [10] },
        'AUDUSD': { id: 99, from: 'AUD', to: 'USD', interval: [10] },
        'USDCAD': { id: 100, from: 'USD', to: 'USD', interval: [10] },
    }

var x = {}
let socket = new WebSocket("wss://iqoption.com/echo/websocket");

socket.onopen = async function (e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    socket.send(JSON.stringify({ "name": "setOptions", "request_id": "-1", "msg": { "sendResults": true } }));
    socket.send(JSON.stringify({ "name": "ssid", "request_id": "786", "msg": "0404bec7527874cb0149d8ecca5b9b12" }));

    setTimeout(async function () {
        for (var key in currencyList) {
            socket.send(JSON.stringify({ "name": "subscribeMessage", "request_id": key + "_" + currencyList[key].interval[0], "msg": { "name": "candle-generated", "params": { "routingFilters": { "active_id": currencyList[key].id, "size": currencyList[key].interval[0] } } } }));

            let currencyList_template = '<li data-cur="' + currencyList[key].id + '"><span data-value="open" data-display="open"></span><span data-value="close" data-display="close"></span><span data-value="max" data-display="max"></span><span data-value="min" data-display="min"></span></li>'

            let frag = document.createRange().createContextualFragment(currencyList_template);
            document.querySelector('.js-bound-quote').appendChild(frag);
        }
        var bound_quote = document.querySelectorAll('.js-bound-quote li')

        bound_quote.forEach(q => {
            var key = q.getAttribute('data-cur');
            x[key] = {}
            x[key].BoundNode = { }
            x[key].BoundModel = {  }

            q.childNodes.forEach(c => {
                let data_value = c.getAttribute('data-value')
                let data_display = c.getAttribute('data-display')
                x[key].BoundNode[data_value] = new BoundNode(c, data_display + ": {{ value }}")
                x[key].BoundModel[data_value] = new BoundModel()
                x[key].BoundModel[data_value].add_callback(function () {
                    x[key].BoundNode[data_value].update(x[key].BoundModel[data_value])
                })
            })
        });
    }, 500);
};

socket.onmessage = async function (event) {
    var incomingMessage = JSON.parse(event.data);
    if (incomingMessage.name == "candle-generated") {
        if (x[incomingMessage.msg.active_id].BoundModel.open.value != incomingMessage.msg.open) {
            x[incomingMessage.msg.active_id].BoundModel.open.value = incomingMessage.msg.open
        }
        if (x[incomingMessage.msg.active_id].BoundModel.max.value != incomingMessage.msg.max) {
            x[incomingMessage.msg.active_id].BoundModel.max.value = incomingMessage.msg.max
        }
        if (x[incomingMessage.msg.active_id].BoundModel.min.value != incomingMessage.msg.min) {
            x[incomingMessage.msg.active_id].BoundModel.min.value = incomingMessage.msg.min
        }
        x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.close

        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.id
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.at
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.from
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.to
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.ask
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.bid
        // x[incomingMessage.msg.active_id].BoundModel.close.value = incomingMessage.msg.volume
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


class BoundNode {
    constructor(node, template) {
        this.template = template
        this.node = node
    }

    update(data) {
        let temp_template = this.template.slice(0)
        this.node.innerHTML = temp_template.replace(/\{\{\s?(\w+)\s?\}\}/g, (match, variable) => {
            return data[variable] || ''
        })
    }
}

class BoundModel {
    constructor(handlers) {
        const callbacks = []
        const data = {
            add_callback: function add_callback(fn) {
                callbacks.push(fn)
            }
        }

        const proxy = new Proxy(data, {
            set: function (target, property, value) {
                target[property] = value
                callbacks.forEach((callback) => callback())
                return true
            }
        })

        return proxy
    }
}
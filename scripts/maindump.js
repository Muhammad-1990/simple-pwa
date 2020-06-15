window.onload = () => {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js');
    }
}

class CurrencyNode {
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

class CurrencyModel {
    constructor(handlers) {
        const callbacks = []
        const data = {
            add_callback: async function add_callback(fn) {
                callbacks.push(fn)
            }
        }

        const proxy = new Proxy(data, {
            set: async function (target, property, value) {
                target[property] = value
                callbacks.forEach((callback) => callback(property))
                return true
            }
        })

        return proxy
    }
}

var currencyList =
    {
        1: { active_id: 1, pair: 'EURUSD', from: 'EUR', to: 'USD', interval: [10]    ,name:"European Euro", heading:"European EUR / USD", Nodes: [], Model: new CurrencyModel() },
        5: { active_id: 5, pair: 'GBPUSD', from: 'GBP', to: 'USD', interval: [10]    ,name:"Great British Pound", heading:"British Pound GBP / USD", Nodes: [], Model: new CurrencyModel() },
        6: { active_id: 6, pair: 'USDJPY', from: 'USD', to: 'JPY', interval: [10]    ,name:"Japanese Yen", heading:"Japanese Yen / USD", Nodes: [], Model: new CurrencyModel() },
        8: { active_id: 8, pair: 'NZDUSD', from: 'NZD', to: 'USD', interval: [10]    ,name:"New Zealand Dollar", heading:"New Zealand Dollor NZD / USD", Nodes: [], Model: new CurrencyModel() },
        72: { active_id: 72, pair: 'USDCHF', from: 'USD', to: 'CHF', interval: [10]  ,name:"Swiss Franc", heading:"European EUR / USD", Nodes: [], Model: new CurrencyModel() },
        99: { active_id: 99, pair: 'AUDUSD', from: 'AUD', to: 'USD', interval: [10]  ,name:"Australian Dollar", heading:"European EUR / USD", Nodes: [], Model: new CurrencyModel() },
        100: { active_id: 100, pair: 'USDCAD', from: 'USD', to: 'USD', interval: [10],name:"Canadian Dollar", heading:"Canadian Dollar EUR / USD", Nodes: [], Model: new CurrencyModel() },
        //2: { active_id: 2, pair: 'EURGBP', from: 'EUR', to: 'GBP', interval: [10]    ,name:"", heading:"British Pound GBP / USD", Nodes: [], Model: new CurrencyModel() },
    }

let socket = new WebSocket("wss://iqoption.com/echo/websocket");

socket.onopen = async function (e) {
    console.log("[open] Connection established");
    console.log("Sending to server");
    socket.send(JSON.stringify({ "name": "setOptions", "request_id": "-1", "msg": { "sendResults": true } }));
    socket.send(JSON.stringify({ "name": "ssid", "request_id": "786", "msg": "0404bec7527874cb0149d8ecca5b9b12" }));

    setTimeout(async function () {
        for (var key in currencyList) {
            socket.send(JSON.stringify({ "name": "subscribeMessage", "request_id": key + "_" + currencyList[key].interval[0], "msg": { "name": "candle-generated", "params": { "routingFilters": { "active_id": currencyList[key].active_id, "size": currencyList[key].interval[0] } } } }));

            // let currencyList_template = '<li data-cur="' + currencyList[key].active_id + '"><div class="lislidewrapper"><span data-value="open" data-display="open"></span><span data-value="close" data-display="close"></span><span data-value="max" data-display="max"></span><span data-value="min" data-display="min"></span></div><div class="lislidedetails"></div></li>'
            let currencyList_template = '<li class="tile" data-cur="' + currencyList[key].active_id + '"><div class="lislidewrapper"><span class="close" data-value="close" data-display="close"></span><svg class="icon icon-price-tag"><use xlink:href="#icon-price-tag"></use></svg></div><div class="lislidedetails"><span class="heading">' + currencyList[key].name + '</span><div class="sentiment"><span class="bull"></span></div><div class="changediv"><span class="changetext">change:</span><span class="changevalue">0.0012%</span></div></div></li>'

            let frag = document.createRange().createContextualFragment(currencyList_template);
            document.querySelector('.js-bound-quote').appendChild(frag);
        }

        var bound_quote = document.querySelectorAll('.js-bound-quote li')

        bound_quote.forEach(async q => {
            var key = q.getAttribute('data-cur');

            q.childNodes[0].childNodes.forEach(c => {
                let data_value = c.getAttribute('data-value')
                let data_display = c.getAttribute('data-display')
                currencyList[key].Nodes.push({ [""+data_value+""]: new CurrencyNode(c, "{{ " + data_value + " }}") } )
            })

            currencyList[key].Model.add_callback(async function (property) {
                    currencyList[key].Nodes.find(p => (p[property])? p[property].update(currencyList[key].Model) : null )
            })

            console.log(currencyList[key]);

            // q.onclick = function(){
            //     var element = this;
            //     if(!element.classList.contains("selected")){
            //     element.className += " selected";
            //     }
            // }
        });
    }, 500);
};

socket.onmessage = async function (event) {
    var incomingMessage = JSON.parse(event.data);
    if (incomingMessage.name == "candle-generated") {
        var active_id = incomingMessage.msg.active_id
        currencyList[active_id].Model.close = incomingMessage.msg.close
        currencyList[active_id].Model.volume = incomingMessage.msg.volume

        if (currencyList[active_id].Model.id != incomingMessage.msg.id) {
            currencyList[active_id].Model.id = incomingMessage.msg.id
        }
        if (currencyList[active_id].Model.open != incomingMessage.msg.open) {
            currencyList[active_id].Model.open = incomingMessage.msg.open
        }
        if (currencyList[active_id].Model.max != incomingMessage.msg.max) {
            currencyList[active_id].Model.max = incomingMessage.msg.max
        }
        if (currencyList[active_id].Model.min != incomingMessage.msg.min) {
            currencyList[active_id].Model.min = incomingMessage.msg.min
        }
        if (currencyList[active_id].Model.at != incomingMessage.msg.at) {
            currencyList[active_id].Model.at = incomingMessage.msg.at
        }
        if (currencyList[active_id].Model.from != incomingMessage.msg.from) {
            currencyList[active_id].Model.from = incomingMessage.msg.from
        }
        if (currencyList[active_id].Model.to != incomingMessage.msg.to) {
            currencyList[active_id].Model.to = incomingMessage.msg.to
        }
        if (currencyList[active_id].Model.ask != incomingMessage.msg.ask) {
            currencyList[active_id].Model.ask = incomingMessage.msg.ask
        }
        if (currencyList[active_id].Model.bid != incomingMessage.msg.bid) {
            currencyList[active_id].Model.bid = incomingMessage.msg.bid
        }
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



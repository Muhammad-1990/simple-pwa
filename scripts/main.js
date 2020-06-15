window.onload = () => {
    'use strict';

    if ('serviceWorker' in navigator) {
        navigator.serviceWorker
            .register('./sw.js');
    }
}

// var canvas = document.querySelector('canvas');
// canvas.width = window.innerWidth;
// canvas.height = 500;
// const offscreen = canvas.transferControlToOffscreen();
// var currencyworker = new Worker('js/currencysocket.js');

// currencyworker.postMessage({ canvas: offscreen }, [offscreen]);

// currencyworker.addEventListener('message', function (e) {

// }, false);
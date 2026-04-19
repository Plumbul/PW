const express = require('express');
const WebSocket = require('ws');
const path = require('path');

const app = express();
const PORT = 3001;
const WS_PORT = 8081;

app.use(express.static(path.join(__dirname, 'public')));

const wss = new WebSocket.Server({ port: WS_PORT });

function generateSmartHomeData() {
    const kitchen = Math.random() * 2.5;
    const living = Math.random() * 2.0;
    const bedroom = Math.random() * 1.5;
    
    return JSON.stringify({
        timestamp: Date.now(),
        kitchen: kitchen,
        livingRoom: living,
        bedroom: bedroom,
        totalPower: kitchen + living + bedroom,
        temp: 18 + Math.random() * 10,
        lightOn: Math.random() > 0.2,
        brightness: Math.floor(Math.random() * 100)
    });
}

wss.on('connection', (ws) => {
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(generateSmartHomeData());
        }
    }, 2000);

    ws.on('close', () => clearInterval(interval));
});

app.listen(PORT, () => {
    console.log('-------------------------------------------------------');
    console.log('Сервер системи Smart Home Monitor запущено!');
    console.log(`Локальне посилання для перегляду: http://localhost:${PORT}`);
    console.log(`WebSocket потік працює на порту: ${WS_PORT}`);
    console.log('-------------------------------------------------------');
});

const express = require('express');
const session = require('express-session');
const http = require('http');
const WebSocket = require('ws');
const path = require('path');
const helmet = require('helmet');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(helmet({ contentSecurityPolicy: false }));
app.use(express.json());

app.use(session({
    secret: 'power-grid-secret-2026',
    resave: false,
    saveUninitialized: false,
    cookie: { maxAge: 15 * 60 * 1000 }
}));

app.get('/', (req, res) => {
    if (req.session && req.session.user) {
        res.sendFile(path.join(__dirname, 'index.html'));
    } else {
        res.redirect('/login.html');
    }
});

app.use(express.static(path.join(__dirname, 'public')));

app.use('/auth', require('./routes/auth'));
app.use('/api', require('./routes/api'));

wss.on('connection', (ws) => {
    const interval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                totalLoad: (400 + Math.random() * 150).toFixed(2),
                frequency: (49.9 + Math.random() * 0.2).toFixed(2),
                timestamp: new Date().toLocaleTimeString()
            }));
        }
    }, 2000);
    ws.on('close', () => clearInterval(interval));
});

server.listen(3001, () => console.log('Сервер: http://localhost:3001'));
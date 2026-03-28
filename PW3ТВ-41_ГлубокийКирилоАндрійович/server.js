const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static('public'));

const DATA_DIR = path.join(__dirname, 'data');
const DATA_FILE = path.join(DATA_DIR, 'consumers.json');

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR);
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');

app.get('/api/consumers', (req, res) => {
    const data = fs.readFileSync(DATA_FILE, 'utf8');
    res.json(JSON.parse(data));
});

app.post('/api/consumers', (req, res) => {
    const consumers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    const newRecord = {
        id: Date.now().toString(),
        ...req.body,
        date: new Date().toISOString()
    };
    consumers.push(newRecord);
    fs.writeFileSync(DATA_FILE, JSON.stringify(consumers, null, 2));
    res.json({ success: true, message: 'Запис додано!' });
});

app.delete('/api/consumers/:id', (req, res) => {
    let consumers = JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
    consumers = consumers.filter(c => c.id !== req.params.id);
    fs.writeFileSync(DATA_FILE, JSON.stringify(consumers, null, 2));
    res.json({ success: true });
});

app.listen(PORT, () => console.log(`Сервер працює: http://localhost:${PORT}`));

const express = require('express');
const path = require('path');
const app = express();
const PORT = 3004;

app.use(express.json());
app.use(express.static('public'));

let hydroPlants = [
    {
        id: 1,
        name: "Дніпровська ГЕС",
        installedPower: 1569,
        currentPower: 1250.5,
        waterLevel: 51.4,
        waterFlow: 1450,
        turbineCount: 10,
        turbineEfficiency: 92,
        reservoirVolume: 3330
    }
];

app.get('/api/hydro-plants', (req, res) => {
    res.json(hydroPlants);
});

app.get('/api/hydro-plants/:id', (req, res) => {
    const plant = hydroPlants.find(h => h.id === parseInt(req.params.id));
    if (!plant) return res.status(404).json({ error: "Not found" });
    res.json(plant);
});

app.get('/api/hydro-plants/:id/water-data', (req, res) => {
    const plant = hydroPlants.find(h => h.id === parseInt(req.params.id));
    if (!plant) return res.status(404).json({ error: "Not found" });
    
    // Повертаємо лише специфічні поля згідно з ТЗ
    res.json({
        waterLevel: plant.waterLevel,
        waterFlow: plant.waterFlow,
        reservoirVolume: plant.reservoirVolume
    });
});

app.post('/api/hydro-plants', (req, res) => {
    const newId = hydroPlants.length > 0 ? Math.max(...hydroPlants.map(h => h.id)) + 1 : 1;
    const newPlant = { ...req.body, id: newId };
    hydroPlants.push(newPlant);
    res.status(201).json(newPlant);
});

app.put('/api/hydro-plants/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = hydroPlants.findIndex(h => h.id === id);
    if (index === -1) return res.status(404).json({ error: "Not found" });

    hydroPlants[index] = { ...req.body, id: id };
    res.json(hydroPlants[index]);
});

app.delete('/api/hydro-plants/:id', (req, res) => {
    const index = hydroPlants.findIndex(h => h.id === parseInt(req.params.id));
    if (index === -1) return res.status(404).json({ error: "Not found" });
    const deleted = hydroPlants.splice(index, 1);
    res.json(deleted[0]);
});

app.listen(PORT, () => {
    console.log(`\n====================================================`);
    console.log(`Сервер ГЕС запущено: http://localhost:${PORT}`);
    console.log(`====================================================\n`);
});
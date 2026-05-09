const express = require('express');
const router = express.Router();

// Middleware для перевірки авторизації (вбудовано для простоти)
const isAuthenticated = (req, res, next) => {
    if (req.session && req.session.user) return next();
    res.status(401).json({ error: "Сесія закінчилася. Увійдіть знову." });
};

// Middleware для перевірки ролей
const authorize = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.session.user.role)) {
            return res.status(403).json({ error: "Доступ заборонено для вашої ролі" });
        }
        next();
    };
};

// GET /api/network/load - Доступно всім авторизованим
router.get('/network/load', isAuthenticated, (req, res) => {
    res.json({ 
        status: "Стабільно", 
        load: "485 MW" 
    });
});

// POST /api/network/switch - Тільки для Senior та Chief
router.post('/network/switch', isAuthenticated, authorize(['dispatcher_senior', 'chief_dispatcher']), (req, res) => {
    const { action } = req.body;
    
    // ЛОГУВАННЯ КРИТИЧНОЇ ОПЕРАЦІЇ
    console.log(`[CRITICAL LOG] ${new Date().toLocaleString()}`);
    console.log(`Користувач: ${req.session.user.email}`);
    console.log(`Дія: Перемикання режиму на [${action}]`);
    console.log(`-----------------------------------`);

    res.json({ message: `Систему успішно переведено в режим: ${action}` });
});

// GET /api/analytics - Тільки для Chief
router.get('/analytics', isAuthenticated, authorize(['chief_dispatcher']), (req, res) => {
    res.json({ 
        report: "Добове споживання енергії в межах норми. Втрати на лініях < 2%.",
        peakTime: "18:45 - 20:15"
    });
});

module.exports = router;
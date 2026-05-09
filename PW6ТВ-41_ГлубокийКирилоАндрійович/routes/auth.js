const express = require('express');
const router = express.Router();
const crypto = require('crypto');

const users = [];

const hash = (password) => crypto.createHash('sha256').update(password).digest('hex');

router.post('/register', (req, res) => {
    const { email, password, role } = req.body;
    
    if (users.find(u => u.email === email)) {
        return res.status(400).json({ error: "Користувач з таким Email вже існує" });
    }

    users.push({ 
        email, 
        password: hash(password), 
        role 
    });

    res.json({ status: "success" });
});

router.post('/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === hash(password));

    if (!user) {
        return res.status(401).json({ error: "Невірний email або пароль" });
    }

    if (user.role === 'chief_dispatcher') {
        return res.json({ needs2FA: true, email: user.email });
    }

    req.session.user = user;
    res.json({ status: "success", role: user.role });
});

router.post('/2fa/verify', (req, res) => {
    const { email, code } = req.body;
    
    if (code === "123456") {
        const user = users.find(u => u.email === email);
        if (user) {
            req.session.user = user;
            return res.json({ status: "success" });
        }
    }
    res.status(401).json({ error: "Невірний код підтвердження" });
});

module.exports = router;
module.exports = {
    isAuthenticated: (req, res, next) => {
        if (req.session && req.session.user) {
            return next();
        }
        res.status(401).json({ error: "Сесія закінчилася або ви не авторизовані. Будь ласка, увійдіть знову." });
    },

    authorize: (roles = []) => {
        return (req, res, next) => {
            if (!req.session.user || !roles.includes(req.session.user.role)) {
                return res.status(403).json({ error: "Доступ заборонено: у вас недостатньо прав для цієї операції." });
            }
            next();
        };
    }
};
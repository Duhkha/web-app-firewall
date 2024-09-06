const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = process.env;

module.exports = async function authMiddleware(req, res, next) {
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {}) : {};

    const token = cookies.vbuck;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            res.clearCookie('vbuck');
            return res.redirect('/admin/login');
        }

        req.user = user;  
        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        res.clearCookie('vbuck');
        return res.redirect('/admin/login');
    }
};

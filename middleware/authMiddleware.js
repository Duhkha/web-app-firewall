const jwt = require('jsonwebtoken');
const { JWT_SECRET } = process.env;

module.exports = function authMiddleware(req, res, next) {
    // manually parse the cookies from the request headers
    const cookies = req.headers.cookie ? req.headers.cookie.split(';').reduce((acc, cookie) => {
        const [name, value] = cookie.trim().split('=');
        acc[name] = value;
        return acc;
    }, {}) : {};

    const token = cookies.token;

    if (!token) {
        return res.redirect('/admin/login');
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        req.userId = decoded.userId;
        next();
    } catch (error) {
        console.error('JWT verification failed:', error);
        res.clearCookie('token');
        return res.redirect('/admin/login');
    }
};

const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = process.env;

exports.getLogin = (req, res) => {
    res.render('auth/login', {
        title: 'Admin Login',
        user: null,
        error: null
    });
};

exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && await user.comparePassword(password)) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

            res.cookie('vbuck', token, { httpOnly: true });
            return res.redirect('/admin');
        } else {
            return res.render('auth/login', { title: 'Admin Login', error: 'Invalid credentials', user: null });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.render('auth/login', { title: 'Admin Login', error: 'An error occurred', user: null });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('vbuck');
    res.redirect('/admin/login');
};

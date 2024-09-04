const jwt = require('jsonwebtoken');
const User = require('../models/userModel');
const { JWT_SECRET } = process.env;

exports.getLogin = (req, res) => {
    res.render('login', { error: null });
};

exports.postLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (user && await user.comparePassword(password)) {
            const token = jwt.sign({ userId: user._id }, JWT_SECRET, { expiresIn: '1h' });

            res.cookie('token', token, { httpOnly: true });
            return res.redirect('/admin');
        } else {
            return res.render('login', { error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error(error);
        return res.render('login', { error: 'An error occurred' });
    }
};

exports.logout = (req, res) => {
    res.clearCookie('token');
    res.redirect('/admin/login');
};

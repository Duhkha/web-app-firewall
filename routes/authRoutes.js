const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/admin/login', authController.getLogin);
router.post('/admin/login', express.urlencoded({ extended: true }), authController.postLogin);
router.get('/admin/logout', authController.logout);

module.exports = router;

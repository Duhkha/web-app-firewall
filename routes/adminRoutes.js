const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/admin', authMiddleware, adminController.getAdminPage);
router.post('/admin/settings', express.urlencoded({ extended: true }), authMiddleware, adminController.updateSettings);
router.post('/admin/rules', authMiddleware, adminController.addRule);

module.exports = router;

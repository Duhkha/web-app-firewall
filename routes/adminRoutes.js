const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, adminController.getDashboard);
router.post('/settings', authMiddleware, express.json(), adminController.saveSettings);

router.get('/rules/:id/edit', authMiddleware, express.json(), adminController.getRule);
router.post('/rules', authMiddleware, express.json(), adminController.saveRule);
router.put('/rules/:id/edit', authMiddleware, express.json(), adminController.saveRule);
router.delete('/rules/:id', authMiddleware, adminController.deleteRule);

router.get('/rule-groups/:id/edit', authMiddleware, express.json(), adminController.getRuleGroup);
router.post('/rule-groups', authMiddleware, express.json(), adminController.saveRuleGroup);
router.put('/rule-groups/:id/edit', authMiddleware, express.json(), adminController.saveRuleGroup);
router.delete('/rule-groups/:id', authMiddleware, adminController.deleteRuleGroup);
router.put('/rule-groups/:id/toggle-activation', authMiddleware, adminController.toggleActivation);



module.exports = router;

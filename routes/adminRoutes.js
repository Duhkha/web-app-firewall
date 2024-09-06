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



/* 
router.get('/rule-groups', adminController.getRuleGroups);
router.post('/rule-groups', adminController.addRuleGroup);
router.get('/rule-groups/:id/edit', adminController.editRuleGroup);
router.put('/rule-groups/:id/edit', adminController.updateRuleGroup);
router.post('/rule-groups/:id/toggle-activation', adminController.toggleRuleGroupActivation);
router.delete('/rule-groups/:id', adminController.deleteRuleGroup);
*/


module.exports = router;

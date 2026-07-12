const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');

router.get('/', leadController.getLeads);
router.post('/', leadController.createLead);
router.put('/:id/status', leadController.updateLeadStatus);
router.get('/export', leadController.exportLeadsCSV);

module.exports = router;

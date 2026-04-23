const express = require('express');
const { getStats, getReportData } = require('../controllers/statsController');
const auth = require('../middleware/auth');
const router = express.Router();

router.use(auth);
router.get('/', getStats);
router.get('/report', getReportData);

module.exports = router;
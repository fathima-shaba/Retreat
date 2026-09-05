const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const { verifyToken } = require('../middleware/auth');

router.get('/occupancy', verifyToken, reportsController.getOccupancyReport);
router.get('/financials', verifyToken, reportsController.getFinancialReport);
router.get('/export/:type', verifyToken, reportsController.exportCSV);

module.exports = router;

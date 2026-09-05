const express = require('express');
const router = express.Router();
const reportsController = require('../controllers/reportsController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/occupancy', authMiddleware, reportsController.getOccupancyReport);
router.get('/financials', authMiddleware, reportsController.getFinancialReport);
router.get('/export/:type', authMiddleware, reportsController.exportCSV);

module.exports = router;

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware);

router.get('/', attendanceController.getAttendance);
router.post('/', requireAdmin, attendanceController.markAttendance);

module.exports = router;

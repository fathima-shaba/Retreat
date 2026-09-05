const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', authMiddleware, leaveController.getAllLeaveRequests);
router.post('/', authMiddleware, requireAdmin, leaveController.createLeaveRequest);
router.put('/:id/status', authMiddleware, requireAdmin, leaveController.updateLeaveStatus);

module.exports = router;

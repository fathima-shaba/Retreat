const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, leaveController.getAllLeaveRequests);
router.post('/', authMiddleware, leaveController.createLeaveRequest);
router.put('/:id/status', authMiddleware, leaveController.updateLeaveStatus);

module.exports = router;

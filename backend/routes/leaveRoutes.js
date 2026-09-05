const express = require('express');
const router = express.Router();
const leaveController = require('../controllers/leaveController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, leaveController.getAllLeaveRequests);
router.post('/', verifyToken, leaveController.createLeaveRequest);
router.put('/:id/status', verifyToken, leaveController.updateLeaveStatus);

module.exports = router;

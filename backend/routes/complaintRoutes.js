const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', authMiddleware, complaintController.getAllComplaints);
router.post('/', authMiddleware, requireAdmin, complaintController.createComplaint);
router.put('/:id/status', authMiddleware, requireAdmin, complaintController.updateComplaintStatus);

module.exports = router;

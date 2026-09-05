const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, complaintController.getAllComplaints);
router.post('/', authMiddleware, complaintController.createComplaint);
router.put('/:id/status', authMiddleware, complaintController.updateComplaintStatus);

module.exports = router;

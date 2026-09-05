const express = require('express');
const router = express.Router();
const complaintController = require('../controllers/complaintController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, complaintController.getAllComplaints);
router.post('/', verifyToken, complaintController.createComplaint);
router.put('/:id/status', verifyToken, complaintController.updateComplaintStatus);

module.exports = router;

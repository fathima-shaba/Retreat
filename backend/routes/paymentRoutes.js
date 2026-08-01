const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware);

router.get('/', paymentController.getAllPayments);
router.post('/', requireAdmin, paymentController.createPayment);
router.put('/:id', requireAdmin, paymentController.updatePayment);
router.delete('/:id', requireAdmin, paymentController.deletePayment);

module.exports = router;

const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.get('/', authMiddleware, visitorController.getAllVisitors);
router.post('/', authMiddleware, requireAdmin, visitorController.registerVisitor);
router.put('/:id/checkout', authMiddleware, requireAdmin, visitorController.checkoutVisitor);

module.exports = router;

const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', authMiddleware, visitorController.getAllVisitors);
router.post('/', authMiddleware, visitorController.registerVisitor);
router.put('/:id/checkout', authMiddleware, visitorController.checkoutVisitor);

module.exports = router;

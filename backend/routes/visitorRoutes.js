const express = require('express');
const router = express.Router();
const visitorController = require('../controllers/visitorController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, visitorController.getAllVisitors);
router.post('/', verifyToken, visitorController.registerVisitor);
router.put('/:id/checkout', verifyToken, visitorController.checkoutVisitor);

module.exports = router;

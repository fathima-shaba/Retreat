const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware);

router.get('/', expenseController.getAllExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.post('/', requireAdmin, expenseController.createExpense);
router.put('/:id', requireAdmin, expenseController.updateExpense);
router.delete('/:id', requireAdmin, expenseController.deleteExpense);

module.exports = router;

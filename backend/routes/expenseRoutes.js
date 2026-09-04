const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController');
const authMiddleware = require('../middleware/authMiddleware');
const requireAdmin = require('../middleware/requireAdmin');

router.use(authMiddleware);

// Category endpoints
router.get('/categories', expenseController.getCategories);
router.post('/categories', requireAdmin, expenseController.createCategory);
router.put('/categories/:id', requireAdmin, expenseController.updateCategory);
router.delete('/categories/:id', requireAdmin, expenseController.deleteCategory);

// Expense endpoints
router.get('/', expenseController.getAllExpenses);
router.get('/stats', expenseController.getExpenseStats);
router.post('/', requireAdmin, expenseController.createExpense);
router.put('/:id', requireAdmin, expenseController.updateExpense);
router.delete('/:id', requireAdmin, expenseController.deleteExpense);

module.exports = router;

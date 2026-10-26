const express = require('express');
const router = express.Router();
const { protect, requirePaid } = require('../middleware/authMiddleware');
const { addExpense, getExpenses, updateExpense, deleteExpense } = require('../controllers/expenseController.js');

router.post('/', protect, addExpense);
router.get('/', protect, getExpenses);
router.put('/:id', protect, updateExpense);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
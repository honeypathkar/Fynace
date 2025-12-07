const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  uploadExpenses,
  addExpense,
  updateExpense,
  getExpensesByMonth,
  getAllExpenses,
  getExpenseSummary,
  compareExpenses,
  getAllTimeSummary,
} = require('../controllers/expenseController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Upload expenses in bulk
router.post('/upload', uploadExpenses);

// Add single expense
router.post(
  '/',
  [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('category').optional().trim(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('moneyIn').optional().isNumeric().withMessage('MoneyIn must be a number'),
    body('moneyOut').optional().isNumeric().withMessage('MoneyOut must be a number'),
    body('remaining').optional().isNumeric().withMessage('Remaining must be a number'),
  ],
  addExpense
);

// Update single expense
router.put(
  '/:id',
  [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('category').optional().trim(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('moneyIn').optional().isNumeric().withMessage('MoneyIn must be a number'),
    body('moneyOut').optional().isNumeric().withMessage('MoneyOut must be a number'),
    body('remaining').optional().isNumeric().withMessage('Remaining must be a number'),
  ],
  updateExpense
);

// Get all-time expense summary (must come before /summary/:month to avoid route conflict)
router.get('/summary/all-time', getAllTimeSummary);

// Get expense summary for a month
router.get('/summary/:month', getExpenseSummary);

// Get all expenses (must come before /:month to avoid route conflict)
router.get('/all', getAllExpenses);

// Update single expense (must come before /:month to avoid route conflict)
router.put(
  '/:id',
  [
    body('month').matches(/^\d{4}-\d{2}$/).withMessage('Month must be in YYYY-MM format'),
    body('itemName').trim().notEmpty().withMessage('Item name is required'),
    body('category').optional().trim(),
    body('amount').optional().isNumeric().withMessage('Amount must be a number'),
    body('moneyIn').optional().isNumeric().withMessage('MoneyIn must be a number'),
    body('moneyOut').optional().isNumeric().withMessage('MoneyOut must be a number'),
    body('remaining').optional().isNumeric().withMessage('Remaining must be a number'),
  ],
  updateExpense
);

// Get expenses by month
router.get('/:month', getExpensesByMonth);

// Compare expenses between two months
router.get('/compare', compareExpenses);

module.exports = router;


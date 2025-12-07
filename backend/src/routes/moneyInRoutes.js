const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  addMoneyIn,
  getMoneyInHistory,
  getTotalMoneyIn,
  deleteMoneyIn,
} = require('../controllers/moneyInController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Add money in entry
router.post(
  '/',
  [
    body('amount').isNumeric().withMessage('Amount must be a number').custom((value) => {
      if (value <= 0) {
        throw new Error('Amount must be greater than 0');
      }
      return true;
    }),
    body('date').optional().isISO8601().withMessage('Date must be a valid ISO 8601 date'),
    body('notes').optional().trim(),
  ],
  addMoneyIn
);

// Get money in history
router.get('/history', getMoneyInHistory);

// Get total money in
router.get('/total', getTotalMoneyIn);

// Delete money in entry
router.delete('/:id', deleteMoneyIn);

module.exports = router;


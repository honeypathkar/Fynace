const express = require('express');
const router = express.Router();
const { authenticate } = require('../middleware/auth');
const {
  getCategories,
  createCategory,
  deleteCategory,
} = require('../controllers/categoryController');

// All routes require authentication
router.use(authenticate);

// Get all categories (default + user's custom)
router.get('/', getCategories);

// Create a custom category
router.post('/', createCategory);

// Delete a custom category
router.delete('/:id', deleteCategory);

module.exports = router;


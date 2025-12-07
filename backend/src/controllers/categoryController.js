const Category = require('../models/Category');

// Default categories that should be available to everyone
const DEFAULT_CATEGORIES = [
  'Food',
  'Stationary',
  'Tickets',
  'Auto Rides',
  'Shopping',
  'Bills',
  'Entertainment',
  'Healthcare',
  'Education',
  'Travel',
  'Utilities',
  'Other',
];

// Initialize default categories if they don't exist
const initializeDefaultCategories = async () => {
  try {
    for (const categoryName of DEFAULT_CATEGORIES) {
      await Category.findOneAndUpdate(
        { name: categoryName, isDefault: true },
        { name: categoryName, isDefault: true, userId: null },
        { upsert: true, new: true }
      );
    }
  } catch (error) {
    console.error('Error initializing default categories:', error);
  }
};

// Get all categories (default + user's custom categories)
const getCategories = async (req, res) => {
  try {
    // Initialize default categories if needed
    await initializeDefaultCategories();

    const userId = req.userId;

    // Get default categories
    const defaultCategories = await Category.find({ isDefault: true }).select('name isDefault');

    // Get user's custom categories
    const userCategories = await Category.find({ userId, isDefault: false }).select('name isDefault');

    res.status(200).json({
      success: true,
      data: {
        default: defaultCategories.map(cat => cat.name),
        custom: userCategories.map(cat => cat.name),
        all: [...defaultCategories.map(cat => cat.name), ...userCategories.map(cat => cat.name)],
      },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Create a custom category for the user
const createCategory = async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.userId;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Category name is required',
      });
    }

    const categoryName = name.trim();

    // Check if category already exists (default or user's custom)
    const existingDefault = await Category.findOne({ name: categoryName, isDefault: true });
    if (existingDefault) {
      return res.status(400).json({
        success: false,
        message: 'This category already exists as a default category',
      });
    }

    const existingUserCategory = await Category.findOne({ name: categoryName, userId });
    if (existingUserCategory) {
      return res.status(400).json({
        success: false,
        message: 'You already have a category with this name',
      });
    }

    // Create new custom category
    const category = await Category.create({
      name: categoryName,
      isDefault: false,
      userId,
    });

    res.status(201).json({
      success: true,
      data: {
        name: category.name,
        isDefault: category.isDefault,
      },
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Delete a user's custom category
const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const category = await Category.findOne({ _id: id, userId, isDefault: false });

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found or you do not have permission to delete it',
      });
    }

    await Category.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  getCategories,
  createCategory,
  deleteCategory,
  initializeDefaultCategories,
};


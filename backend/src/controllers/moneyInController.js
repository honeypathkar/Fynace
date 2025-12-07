const MoneyIn = require('../models/MoneyIn');
const mongoose = require('mongoose');
const { body, validationResult } = require('express-validator');

// Add money in entry
const addMoneyIn = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation errors',
        errors: errors.array(),
      });
    }

    const { amount, date, notes } = req.body;
    const userId = req.userId;

    if (!amount || amount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than 0',
      });
    }

    const moneyIn = await MoneyIn.create({
      userId,
      amount: Number(amount),
      date: date ? new Date(date) : new Date(),
      notes: notes || '',
    });

    res.status(201).json({
      success: true,
      data: moneyIn,
    });
  } catch (error) {
    console.error('Error adding money in:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get all money in entries for user
const getMoneyInHistory = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 100, skip = 0 } = req.query;

    const moneyInEntries = await MoneyIn.find({ userId })
      .sort({ date: -1, createdAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await MoneyIn.countDocuments({ userId });

    res.status(200).json({
      success: true,
      data: moneyInEntries,
      total,
    });
  } catch (error) {
    console.error('Error fetching money in history:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Get total money in
const getTotalMoneyIn = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await MoneyIn.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const total = result.length > 0 ? result[0].total : 0;
    const count = result.length > 0 ? result[0].count : 0;

    res.status(200).json({
      success: true,
      data: {
        total,
        count,
      },
    });
  } catch (error) {
    console.error('Error fetching total money in:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

// Delete money in entry
const deleteMoneyIn = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const moneyIn = await MoneyIn.findOne({ _id: id, userId });

    if (!moneyIn) {
      return res.status(404).json({
        success: false,
        message: 'Money in entry not found',
      });
    }

    await MoneyIn.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Money in entry deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting money in:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server Error',
    });
  }
};

module.exports = {
  addMoneyIn,
  getMoneyInHistory,
  getTotalMoneyIn,
  deleteMoneyIn,
};


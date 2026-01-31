const Expense = require("../models/Expense");
const MoneyIn = require("../models/MoneyIn");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");

// Upload expenses in bulk from JSON
const uploadExpenses = async (req, res) => {
  try {
    const { expenses } = req.body;

    if (!expenses || !Array.isArray(expenses) || expenses.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Expenses array is required and must not be empty",
      });
    }

    const userId = req.userId;
    const expensesToSave = expenses.map((expense) => ({
      userId,
      month: expense.month || expense.Month,
      itemName:
        expense.itemName ||
        expense.ItemName ||
        expense.category ||
        expense.Category ||
        "Expense",
      category: expense.category || expense.Category || "",
      amount: expense.amount || expense.Amount || 0,
      notes: expense.notes || expense.Notes || "",
      moneyIn: expense.moneyIn || expense.MoneyIn || 0,
      moneyOut: expense.moneyOut || expense.MoneyOut || 0,
      remaining: expense.remaining || expense.Remaining || 0,
    }));

    // Validate month format (YYYY-MM)
    const monthRegex = /^\d{4}-\d{2}$/;
    for (const expense of expensesToSave) {
      if (!monthRegex.test(expense.month)) {
        return res.status(400).json({
          success: false,
          message: `Invalid month format: ${expense.month}. Expected format: YYYY-MM`,
        });
      }
    }

    // Insert all expenses
    const savedExpenses = await Expense.insertMany(expensesToSave);

    res.status(201).json({
      success: true,
      message: `${savedExpenses.length} expenses uploaded successfully`,
      count: savedExpenses.length,
      expenses: savedExpenses,
    });
  } catch (error) {
    console.error("Error in uploadExpenses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to upload expenses",
    });
  }
};

// Add single expense manually
const addExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const {
      month,
      itemName,
      category,
      amount,
      notes,
      moneyIn,
      moneyOut,
      remaining,
    } = req.body;
    const userId = req.userId;

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected format: YYYY-MM",
      });
    }

    // Validate itemName
    if (!itemName || !itemName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // If amount is provided but moneyOut is not, set moneyOut = amount
    const finalMoneyOut = moneyOut || (amount > 0 ? amount : 0);
    const finalMoneyIn = moneyIn || 0;

    // Calculate remaining if not provided
    let calculatedRemaining = remaining;
    if (calculatedRemaining === undefined || calculatedRemaining === null) {
      calculatedRemaining = finalMoneyIn - finalMoneyOut;
    }

    const expense = await Expense.create({
      userId,
      month,
      itemName: itemName.trim(),
      category: category ? category.trim() : "",
      amount: amount || 0,
      notes: notes || "",
      moneyIn: finalMoneyIn,
      moneyOut: finalMoneyOut,
      remaining: calculatedRemaining,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });
  } catch (error) {
    console.error("Error in addExpense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add expense",
    });
  }
};

// Update an existing expense
const updateExpense = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation errors",
        errors: errors.array(),
      });
    }

    const { id } = req.params;
    const {
      month,
      itemName,
      category,
      amount,
      notes,
      moneyIn,
      moneyOut,
      remaining,
    } = req.body;
    const userId = req.userId;

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected format: YYYY-MM",
      });
    }

    // Validate itemName
    if (!itemName || !itemName.trim()) {
      return res.status(400).json({
        success: false,
        message: "Item name is required",
      });
    }

    // Find the expense and verify ownership
    const expense = await Expense.findOne({ _id: id, userId });
    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you do not have permission to update it",
      });
    }

    // If amount is provided but moneyOut is not, set moneyOut = amount
    const finalMoneyOut =
      moneyOut !== undefined
        ? moneyOut
        : amount > 0
          ? amount
          : expense.moneyOut;
    const finalMoneyIn = moneyIn !== undefined ? moneyIn : expense.moneyIn;

    // Calculate remaining if not provided
    let calculatedRemaining = remaining;
    if (calculatedRemaining === undefined || calculatedRemaining === null) {
      calculatedRemaining = finalMoneyIn - finalMoneyOut;
    }

    // Update the expense
    const updatedExpense = await Expense.findByIdAndUpdate(
      id,
      {
        month,
        itemName: itemName.trim(),
        category: category ? category.trim() : "",
        amount: amount || 0,
        notes: notes || "",
        moneyIn: finalMoneyIn,
        moneyOut: finalMoneyOut,
        remaining: calculatedRemaining,
        updatedAt: Date.now(),
      },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      success: true,
      message: "Expense updated successfully",
      expense: updatedExpense,
    });
  } catch (error) {
    console.error("Error in updateExpense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update expense",
    });
  }
};

// Get all expenses for a specific month
const getExpensesByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected format: YYYY-MM",
      });
    }

    const expenses = await Expense.find({ userId, month })
      .sort({ month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Expense.countDocuments({ userId, month });

    res.status(200).json({
      success: true,
      count: expenses.length,
      total: totalCount,
      page,
      limit,
      hasMore: skip + expenses.length < totalCount,
      month,
      expenses,
    });
  } catch (error) {
    console.error("Error in getExpensesByMonth:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expenses",
    });
  }
};

// Get all expenses (not filtered by month) with pagination
const getAllExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const expenses = await Expense.find({ userId })
      .sort({ month: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const totalCount = await Expense.countDocuments({ userId });

    res.status(200).json({
      success: true,
      count: expenses.length,
      total: totalCount,
      page,
      limit,
      hasMore: skip + expenses.length < totalCount,
      expenses,
    });
  } catch (error) {
    console.error("Error in getAllExpenses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expenses",
    });
  }
};

// Get summarized data for a specific month
const getExpenseSummary = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.userId;

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected format: YYYY-MM",
      });
    }

    const startDate = new Date(`${month}-01`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
      23,
      59,
      59,
    );

    const [expenseStats, moneyInStats, categoryStats] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), month } },
        {
          $group: {
            _id: null,
            totalMoneyIn: { $sum: "$moneyIn" },
            totalMoneyOut: {
              $sum: {
                $cond: [{ $gt: ["$moneyOut", 0] }, "$moneyOut", "$amount"],
              },
            },
            totalExpenses: { $sum: 1 },
          },
        },
      ]),
      MoneyIn.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: { $gte: startDate, $lte: endDate },
          },
        },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), month } },
        {
          $group: {
            _id: { $ifNull: ["$category", "Uncategorized"] },
            totalAmount: { $sum: "$amount" },
            totalMoneyIn: { $sum: "$moneyIn" },
            totalMoneyOut: {
              $sum: {
                $cond: [{ $gt: ["$moneyOut", 0] }, "$moneyOut", "$amount"],
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            category: "$_id",
            totalAmount: 1,
            totalMoneyIn: 1,
            totalMoneyOut: 1,
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const expStats = expenseStats[0] || {
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
    };
    const minStats = moneyInStats[0] || { total: 0 };

    const totalMoneyIn = expStats.totalMoneyIn + minStats.total;
    const totalMoneyOut = expStats.totalMoneyOut;
    const remaining = totalMoneyIn - totalMoneyOut;

    res.status(200).json({
      success: true,
      month,
      summary: {
        totalMoneyIn,
        totalMoneyOut,
        remaining,
        totalExpenses: expStats.totalExpenses,
      },
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error("Error in getExpenseSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expense summary",
    });
  }
};

// Compare month-to-month spending
const compareExpenses = async (req, res) => {
  try {
    const { month1, month2 } = req.query;
    const userId = req.userId;

    if (!month1 || !month2) {
      return res.status(400).json({
        success: false,
        message:
          "Both month1 and month2 query parameters are required (format: YYYY-MM)",
      });
    }

    // Validate month format
    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month1) || !monthRegex.test(month2)) {
      return res.status(400).json({
        success: false,
        message: "Invalid month format. Expected format: YYYY-MM",
      });
    }

    // Get expenses for both months
    const [expenses1, expenses2] = await Promise.all([
      Expense.find({ userId, month: month1 }),
      Expense.find({ userId, month: month2 }),
    ]);

    // Calculate totals for month1
    const month1Data = {
      month: month1,
      totalMoneyIn: expenses1.reduce((sum, exp) => sum + (exp.moneyIn || 0), 0),
      totalMoneyOut: expenses1.reduce(
        (sum, exp) => sum + (exp.moneyOut || 0),
        0,
      ),
      totalExpenses: expenses1.length,
    };
    month1Data.remaining = month1Data.totalMoneyIn - month1Data.totalMoneyOut;

    // Calculate totals for month2
    const month2Data = {
      month: month2,
      totalMoneyIn: expenses2.reduce((sum, exp) => sum + (exp.moneyIn || 0), 0),
      totalMoneyOut: expenses2.reduce(
        (sum, exp) => sum + (exp.moneyOut || 0),
        0,
      ),
      totalExpenses: expenses2.length,
    };
    month2Data.remaining = month2Data.totalMoneyIn - month2Data.totalMoneyOut;

    // Calculate differences
    const comparison = {
      moneyIn: {
        month1: month1Data.totalMoneyIn,
        month2: month2Data.totalMoneyIn,
        difference: month2Data.totalMoneyIn - month1Data.totalMoneyIn,
        percentageChange:
          month1Data.totalMoneyIn !== 0
            ? ((month2Data.totalMoneyIn - month1Data.totalMoneyIn) /
                month1Data.totalMoneyIn) *
              100
            : 0,
      },
      moneyOut: {
        month1: month1Data.totalMoneyOut,
        month2: month2Data.totalMoneyOut,
        difference: month2Data.totalMoneyOut - month1Data.totalMoneyOut,
        percentageChange:
          month1Data.totalMoneyOut !== 0
            ? ((month2Data.totalMoneyOut - month1Data.totalMoneyOut) /
                month1Data.totalMoneyOut) *
              100
            : 0,
      },
      remaining: {
        month1: month1Data.remaining,
        month2: month2Data.remaining,
        difference: month2Data.remaining - month1Data.remaining,
        percentageChange:
          month1Data.remaining !== 0
            ? ((month2Data.remaining - month1Data.remaining) /
                month1Data.remaining) *
              100
            : 0,
      },
    };

    res.status(200).json({
      success: true,
      comparison,
      month1: month1Data,
      month2: month2Data,
    });
  } catch (error) {
    console.error("Error in compareExpenses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to compare expenses",
    });
  }
};

// Get all-time expense summary (not limited to a specific month)
const getAllTimeSummary = async (req, res) => {
  try {
    const userId = req.userId;

    const [expenseStats, moneyInStats, categoryStats] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalMoneyIn: { $sum: "$moneyIn" },
            totalMoneyOut: {
              $sum: {
                $cond: [{ $gt: ["$moneyOut", 0] }, "$moneyOut", "$amount"],
              },
            },
            totalExpenses: { $sum: 1 },
          },
        },
      ]),
      MoneyIn.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        {
          $group: {
            _id: { $ifNull: ["$category", "Uncategorized"] },
            totalAmount: { $sum: "$amount" },
            totalMoneyIn: { $sum: "$moneyIn" },
            totalMoneyOut: {
              $sum: {
                $cond: [{ $gt: ["$moneyOut", 0] }, "$moneyOut", "$amount"],
              },
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            category: "$_id",
            totalAmount: 1,
            totalMoneyIn: 1,
            totalMoneyOut: 1,
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const expStats = expenseStats[0] || {
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
    };
    const minStats = moneyInStats[0] || { total: 0 };

    const totalMoneyIn = expStats.totalMoneyIn + minStats.total;
    const totalMoneyOut = expStats.totalMoneyOut;
    const remaining = totalMoneyIn - totalMoneyOut;

    res.status(200).json({
      success: true,
      summary: {
        totalMoneyIn,
        totalMoneyOut,
        remaining,
        totalExpenses: expStats.totalExpenses,
      },
      categoryBreakdown: categoryStats,
    });
  } catch (error) {
    console.error("Error in getAllTimeSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get all-time expense summary",
    });
  }
};

// Delete an expense
const deleteExpense = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const expense = await Expense.findOne({ _id: id, userId });

    if (!expense) {
      return res.status(404).json({
        success: false,
        message: "Expense not found or you do not have permission to delete it",
      });
    }

    await Expense.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: "Expense deleted successfully",
    });
  } catch (error) {
    console.error("Error in deleteExpense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete expense",
    });
  }
};

module.exports = {
  uploadExpenses,
  addExpense,
  updateExpense,
  deleteExpense,
  getExpensesByMonth,
  getAllExpenses,
  getExpenseSummary,
  compareExpenses,
  getAllTimeSummary,
};

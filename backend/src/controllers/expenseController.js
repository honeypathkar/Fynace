const Expense = require("../models/Expense");
const MoneyIn = require("../models/MoneyIn");
const mongoose = require("mongoose");
const { body, validationResult } = require("express-validator");
const MonthlySummary = require("../models/MonthlySummary");
const { updateMonthlySummary } = require("../utils/summaryUtils");

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

    // Update monthly summaries for all affected months
    const affectedMonths = [...new Set(expensesToSave.map((e) => e.month))];
    for (const month of affectedMonths) {
      await updateMonthlySummary(userId, month);
    }

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
      date,
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
      date: date || Date.now(),
      moneyIn: finalMoneyIn,
      moneyOut: finalMoneyOut,
      remaining: calculatedRemaining,
    });

    res.status(201).json({
      success: true,
      message: "Expense added successfully",
      expense,
    });

    // Update summary in background
    updateMonthlySummary(userId, month);
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

    // Update summary in background
    updateMonthlySummary(userId, month);
    // If month changed, update old month too
    if (expense.month !== month) {
      updateMonthlySummary(userId, expense.month);
    }
  } catch (error) {
    console.error("Error in updateExpense:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update expense",
    });
  }
};

// Get all expenses for a specific month with cursor-based pagination
const getExpensesByMonth = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;
    const lastCreatedAt = req.query.lastCreatedAt;
    const { category, search } = req.query;

    const query = { userId, month };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .select(
        "amount category itemName date month createdAt moneyIn moneyOut notes",
      )
      .lean();

    const hasMore = expenses.length > limit;
    const results = hasMore ? expenses.slice(0, limit) : expenses;

    res.status(200).json({
      success: true,
      count: results.length,
      limit,
      hasMore,
      month,
      expenses: results,
      lastCreatedAt:
        results.length > 0 ? results[results.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error("Error in getExpensesByMonth:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expenses",
    });
  }
};

// Get all expenses with cursor-based pagination
const getAllExpenses = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 20;
    const lastCreatedAt = req.query.lastCreatedAt;
    const { category, search } = req.query;

    const query = { userId };

    if (category && category !== "All") {
      query.category = category;
    }

    if (search) {
      query.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    if (lastCreatedAt) {
      query.createdAt = { $lt: new Date(lastCreatedAt) };
    }

    const expenses = await Expense.find(query)
      .sort({ createdAt: -1 })
      .limit(limit + 1)
      .select(
        "amount category itemName date month createdAt moneyIn moneyOut notes",
      )
      .lean();

    const hasMore = expenses.length > limit;
    const results = hasMore ? expenses.slice(0, limit) : expenses;

    res.status(200).json({
      success: true,
      count: results.length,
      limit,
      hasMore,
      expenses: results,
      lastCreatedAt:
        results.length > 0 ? results[results.length - 1].createdAt : null,
    });
  } catch (error) {
    console.error("Error in getAllExpenses:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expenses",
    });
  }
};

// Get summarized data for a specific month (optimized with pre-computed data)
const getExpenseSummary = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.userId;
    const { category, search } = req.query;

    // If filtering, we must compute summary on the fly
    if ((category && category !== "All") || search) {
      const matchQuery = { userId: new mongoose.Types.ObjectId(userId), month };
      if (category && category !== "All") {
        matchQuery.category = category;
      }
      if (search) {
        matchQuery.$or = [
          { itemName: { $regex: search, $options: "i" } },
          { category: { $regex: search, $options: "i" } },
          { notes: { $regex: search, $options: "i" } },
        ];
      }

      const results = await Expense.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            summaryStats: [
              {
                $group: {
                  _id: null,
                  totalMoneyIn: { $sum: "$moneyIn" },
                  totalMoneyOut: {
                    $sum: {
                      $cond: [
                        { $gt: ["$moneyOut", 0] },
                        "$moneyOut",
                        "$amount",
                      ],
                    },
                  },
                  totalExpenses: { $sum: 1 },
                },
              },
            ],
            categoryBreakdown: [
              {
                $group: {
                  _id: "$category",
                  totalAmount: { $sum: "$amount" },
                  totalMoneyIn: { $sum: "$moneyIn" },
                  totalMoneyOut: {
                    $sum: {
                      $cond: [
                        { $gt: ["$moneyOut", 0] },
                        "$moneyOut",
                        "$amount",
                      ],
                    },
                  },
                  count: { $sum: 1 },
                },
              },
            ],
          },
        },
      ]);

      const stats = results[0]?.summaryStats[0] || {
        totalMoneyIn: 0,
        totalMoneyOut: 0,
        totalExpenses: 0,
      };

      const breakdown = results[0]?.categoryBreakdown || [];

      return res.status(200).json({
        success: true,
        month,
        summary: {
          totalMoneyIn: stats.totalMoneyIn,
          totalMoneyOut: stats.totalMoneyOut,
          remaining: stats.totalMoneyIn - stats.totalMoneyOut,
          totalExpenses: stats.totalExpenses,
        },
        categoryBreakdown: breakdown.map((c) => ({
          category: c._id,
          totalAmount: c.totalAmount,
          totalMoneyIn: c.totalMoneyIn,
          totalMoneyOut: c.totalMoneyOut,
          count: c.count,
        })),
      });
    }

    // Try to get from pre-computed summary first
    let summaryData = await MonthlySummary.findOne({ userId, month });

    if (!summaryData) {
      // If not exists, compute it now and return
      await updateMonthlySummary(userId, month);
      summaryData = await MonthlySummary.findOne({ userId, month });
    }

    if (!summaryData) {
      return res.status(200).json({
        success: true,
        month,
        summary: {
          totalMoneyIn: 0,
          totalMoneyOut: 0,
          remaining: 0,
          totalExpenses: 0,
        },
        categoryBreakdown: [],
      });
    }

    res.status(200).json({
      success: true,
      month,
      summary: {
        totalMoneyIn: summaryData.totalMoneyIn,
        totalMoneyOut: summaryData.totalMoneyOut,
        remaining: summaryData.remaining,
        totalExpenses: summaryData.totalExpenses,
      },
      categoryBreakdown: summaryData.categoryBreakdown,
    });
  } catch (error) {
    console.error("Error in getExpenseSummary:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get expense summary",
    });
  }
};

// Compare month-to-month spending (optimized with pre-computed data)
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

    // Get summaries for both months
    let [summary1, summary2] = await Promise.all([
      MonthlySummary.findOne({ userId, month: month1 }),
      MonthlySummary.findOne({ userId, month: month2 }),
    ]);

    // Compute if missing
    if (!summary1) {
      await updateMonthlySummary(userId, month1);
      summary1 = await MonthlySummary.findOne({ userId, month: month1 });
    }
    if (!summary2) {
      await updateMonthlySummary(userId, month2);
      summary2 = await MonthlySummary.findOne({ userId, month: month2 });
    }

    const data1 = summary1 || {
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
      remaining: 0,
    };
    const data2 = summary2 || {
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
      remaining: 0,
    };

    // Calculate differences
    const comparison = {
      moneyIn: {
        month1: data1.totalMoneyIn,
        month2: data2.totalMoneyIn,
        difference: data2.totalMoneyIn - data1.totalMoneyIn,
        percentageChange:
          data1.totalMoneyIn !== 0
            ? ((data2.totalMoneyIn - data1.totalMoneyIn) / data1.totalMoneyIn) *
              100
            : 0,
      },
      moneyOut: {
        month1: data1.totalMoneyOut,
        month2: data2.totalMoneyOut,
        difference: data2.totalMoneyOut - data1.totalMoneyOut,
        percentageChange:
          data1.totalMoneyOut !== 0
            ? ((data2.totalMoneyOut - data1.totalMoneyOut) /
                data1.totalMoneyOut) *
              100
            : 0,
      },
      remaining: {
        month1: data1.remaining,
        month2: data2.remaining,
        difference: data2.remaining - data1.remaining,
        percentageChange:
          data1.remaining !== 0
            ? ((data2.remaining - data1.remaining) / data1.remaining) * 100
            : 0,
      },
    };

    res.status(200).json({
      success: true,
      comparison,
      month1: {
        month: month1,
        totalMoneyIn: data1.totalMoneyIn,
        totalMoneyOut: data1.totalMoneyOut,
        totalExpenses: data1.totalExpenses,
        remaining: data1.remaining,
      },
      month2: {
        month: month2,
        totalMoneyIn: data2.totalMoneyIn,
        totalMoneyOut: data2.totalMoneyOut,
        totalExpenses: data2.totalExpenses,
        remaining: data2.remaining,
      },
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
    const { category, search } = req.query;

    const matchQuery = { userId: new mongoose.Types.ObjectId(userId) };
    if (category && category !== "All") {
      matchQuery.category = category;
    }
    if (search) {
      matchQuery.$or = [
        { itemName: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
        { notes: { $regex: search, $options: "i" } },
      ];
    }

    const [results, moneyInStats] = await Promise.all([
      Expense.aggregate([
        { $match: matchQuery },
        {
          $facet: {
            expenseStats: [
              {
                $group: {
                  _id: null,
                  totalMoneyIn: { $sum: "$moneyIn" },
                  totalMoneyOut: {
                    $sum: {
                      $cond: [
                        { $gt: ["$moneyOut", 0] },
                        "$moneyOut",
                        "$amount",
                      ],
                    },
                  },
                  totalExpenses: { $sum: 1 },
                },
              },
            ],
            categoryStats: [
              {
                $group: {
                  _id: { $ifNull: ["$category", "Uncategorized"] },
                  totalAmount: { $sum: "$amount" },
                  totalMoneyIn: { $sum: "$moneyIn" },
                  totalMoneyOut: {
                    $sum: {
                      $cond: [
                        { $gt: ["$moneyOut", 0] },
                        "$moneyOut",
                        "$amount",
                      ],
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
            ],
          },
        },
      ]),
      MoneyIn.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $group: { _id: null, total: { $sum: "$amount" } } },
      ]),
    ]);

    const expStats = results[0]?.expenseStats[0] || {
      totalMoneyIn: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
    };
    const categoryStats = results[0]?.categoryStats || [];
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

    // Update summary in background
    updateMonthlySummary(userId, expense.month);
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

const Expense = require("../models/Expense");
const MoneyIn = require("../models/MoneyIn");
const MonthlySummary = require("../models/MonthlySummary");
const mongoose = require("mongoose");

// Get monthly totals for chart visualization
const getMonthlyTotals = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 12 } = req.query; // Default to last 12 months

    const summaries = await MonthlySummary.find({ userId })
      .sort({ month: -1 })
      .limit(parseInt(limit))
      .lean();

    // The frontend expects the array in ascending order for charts
    const monthlyArray = summaries
      .map((s) => ({
        month: s.month,
        totalMoneyIn: s.totalMoneyIn,
        totalMoneyOut: s.totalMoneyOut,
        totalExpenses: s.totalExpenses,
        remaining: s.remaining,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    res.status(200).json({
      success: true,
      count: monthlyArray.length,
      data: monthlyArray,
    });
  } catch (error) {
    console.error("Error in getMonthlyTotals:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get monthly totals",
    });
  }
};

// Get category-wise expense distribution for a specific month or all-time
const getCategoryDistribution = async (req, res) => {
  try {
    const { month } = req.params;
    const userId = req.userId;

    const matchStage = { userId: new mongoose.Types.ObjectId(userId) };
    if (month !== "all-time" && month !== "all") {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message:
            'Invalid month format. Expected format: YYYY-MM or "all-time"',
        });
      }
      matchStage.month = month;
    }

    const categoryStats = await Expense.aggregate([
      { $match: matchStage },
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
      { $sort: { totalMoneyOut: -1 } },
    ]);

    const totalMoneyOut = categoryStats.reduce(
      (sum, cat) => sum + cat.totalMoneyOut,
      0,
    );
    const categoryArrayWithPercentages = categoryStats.map((cat) => ({
      ...cat,
      percentage:
        totalMoneyOut > 0 ? (cat.totalMoneyOut / totalMoneyOut) * 100 : 0,
    }));

    res.status(200).json({
      success: true,
      month: month === "all-time" || month === "all" ? "all-time" : month,
      count: categoryStats.length,
      totalMoneyOut,
      data: categoryArrayWithPercentages,
    });
  } catch (error) {
    console.error("Error in getCategoryDistribution:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get category distribution",
    });
  }
};

// Get money in/out trends over time
const getTrends = async (req, res) => {
  try {
    const userId = req.userId;
    const { limit = 12 } = req.query; // Default to last 12 months

    const summaries = await MonthlySummary.find({ userId })
      .sort({ month: -1 })
      .limit(parseInt(limit) + 1) // Get one extra to calculate growth for the oldest month in the limit
      .lean();

    if (summaries.length === 0) {
      return res.status(200).json({
        success: true,
        count: 0,
        data: [],
      });
    }

    // Convert to the format expected by the frontend
    let trendArray = summaries.map((s) => ({
      month: s.month,
      totalMoneyIn: s.totalMoneyIn,
      totalMoneyOut: s.totalMoneyOut,
      remaining: s.remaining,
      averageMoneyIn: s.moneyInCount > 0 ? s.totalMoneyIn / s.moneyInCount : 0,
      averageMoneyOut:
        s.expenseCount > 0 ? s.totalMoneyOut / s.expenseCount : 0,
      transactionCount: (s.moneyInCount || 0) + (s.expenseCount || 0),
    }));

    // Sort by month (ascending) for growth calculation
    trendArray.sort((a, b) => a.month.localeCompare(b.month));

    // Calculate growth rates
    const trendsWithGrowth = trendArray.map((data, index) => {
      if (index === 0) {
        return {
          ...data,
          moneyInGrowth: 0,
          moneyOutGrowth: 0,
          remainingGrowth: 0,
        };
      }

      const prevData = trendArray[index - 1];
      const moneyInGrowth =
        prevData.totalMoneyIn !== 0
          ? ((data.totalMoneyIn - prevData.totalMoneyIn) /
              prevData.totalMoneyIn) *
            100
          : 0;
      const moneyOutGrowth =
        prevData.totalMoneyOut !== 0
          ? ((data.totalMoneyOut - prevData.totalMoneyOut) /
              prevData.totalMoneyOut) *
            100
          : 0;
      const remainingGrowth =
        prevData.remaining !== 0
          ? ((data.remaining - prevData.remaining) /
              Math.abs(prevData.remaining)) *
            100
          : 0;

      return {
        ...data,
        moneyInGrowth: parseFloat(moneyInGrowth.toFixed(2)),
        moneyOutGrowth: parseFloat(moneyOutGrowth.toFixed(2)),
        remainingGrowth: parseFloat(remainingGrowth.toFixed(2)),
      };
    });

    // If we fetched an extra month for growth calculation, remove it if it exceeds the limit
    const finalData =
      trendsWithGrowth.length > parseInt(limit)
        ? trendsWithGrowth.slice(1)
        : trendsWithGrowth;

    res.status(200).json({
      success: true,
      count: finalData.length,
      data: finalData,
    });
  } catch (error) {
    console.error("Error in getTrends:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get trends",
    });
  }
};

module.exports = {
  getMonthlyTotals,
  getCategoryDistribution,
  getTrends,
};

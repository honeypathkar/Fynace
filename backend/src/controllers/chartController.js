const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");

const toRupees = (paise) => paise / 100;

function getMonthBounds(monthStr) {
  const [year, month] = monthStr.split("-").map(Number);
  return {
    start: new Date(year, month - 1, 1),
    end: new Date(year, month, 1),
  };
}

// Get monthly totals for chart visualization
const getMonthlyTotals = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 12;

    const results = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          totalMoneyIn: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          totalMoneyOut: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
          totalExpenses: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$count", 0] },
          },
          totalIncome: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$count", 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      { $sort: { _id: 1 } }, // ascending for charts
    ]);

    const monthlyArray = results.map((r) => ({
      month: r._id,
      totalMoneyIn: toRupees(r.totalMoneyIn),
      totalMoneyOut: toRupees(r.totalMoneyOut),
      remaining: toRupees(r.totalMoneyIn - r.totalMoneyOut),
      totalExpenses: r.totalExpenses,
      totalIncome: r.totalIncome,
    }));

    res.status(200).json({
      success: true,
      count: monthlyArray.length,
      data: monthlyArray,
    });
  } catch (error) {
    console.error("Error in getMonthlyTotals:", error);
    res
      .status(500)
      .json({
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

    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
      type: "expense",
    };

    if (month && month !== "all-time" && month !== "all") {
      const monthRegex = /^\d{4}-\d{2}$/;
      if (!monthRegex.test(month)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid month format. Expected YYYY-MM or "all-time"',
        });
      }
      const { start, end } = getMonthBounds(month);
      match.date = { $gte: start, $lt: end };
    }

    const categoryStats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$categoryId",
          totalAmount: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "category",
        },
      },
      {
        $project: {
          category: {
            $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"],
          },
          totalMoneyOut: "$totalAmount",
          totalAmount: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { totalAmount: -1 } },
    ]);

    const totalMoneyOut = categoryStats.reduce(
      (sum, c) => sum + c.totalMoneyOut,
      0,
    );

    res.status(200).json({
      success: true,
      month: month === "all-time" || month === "all" ? "all-time" : month,
      count: categoryStats.length,
      totalMoneyOut: toRupees(totalMoneyOut),
      data: categoryStats.map((c) => ({
        ...c,
        totalAmount: toRupees(c.totalAmount),
        totalMoneyOut: toRupees(c.totalMoneyOut),
        percentage:
          totalMoneyOut > 0
            ? parseFloat(((c.totalMoneyOut / totalMoneyOut) * 100).toFixed(2))
            : 0,
      })),
    });
  } catch (error) {
    console.error("Error in getCategoryDistribution:", error);
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to get category distribution",
      });
  }
};

// Get income/expense trends over time with growth rates
const getTrends = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = parseInt(req.query.limit) || 12;

    const results = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
        },
      },
      {
        $group: {
          _id: {
            month: { $dateToString: { format: "%Y-%m", date: "$date" } },
            type: "$type",
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.month",
          totalMoneyIn: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          totalMoneyOut: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
          moneyInCount: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$count", 0] },
          },
          expenseCount: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$count", 0] },
          },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit + 1 }, // +1 for growth calculation of oldest visible month
      { $sort: { _id: 1 } },
    ]);

    if (results.length === 0) {
      return res.status(200).json({ success: true, count: 0, data: [] });
    }

    const trendArray = results.map((r) => ({
      month: r._id,
      totalMoneyIn: toRupees(r.totalMoneyIn),
      totalMoneyOut: toRupees(r.totalMoneyOut),
      remaining: toRupees(r.totalMoneyIn - r.totalMoneyOut),
      transactionCount: r.moneyInCount + r.expenseCount,
      averageMoneyIn:
        r.moneyInCount > 0 ? toRupees(r.totalMoneyIn / r.moneyInCount) : 0,
      averageMoneyOut:
        r.expenseCount > 0 ? toRupees(r.totalMoneyOut / r.expenseCount) : 0,
    }));

    const trendsWithGrowth = trendArray.map((data, index) => {
      if (index === 0)
        return {
          ...data,
          moneyInGrowth: 0,
          moneyOutGrowth: 0,
          remainingGrowth: 0,
        };
      const prev = trendArray[index - 1];
      return {
        ...data,
        moneyInGrowth:
          prev.totalMoneyIn !== 0
            ? parseFloat(
                (
                  ((data.totalMoneyIn - prev.totalMoneyIn) /
                    prev.totalMoneyIn) *
                  100
                ).toFixed(2),
              )
            : 0,
        moneyOutGrowth:
          prev.totalMoneyOut !== 0
            ? parseFloat(
                (
                  ((data.totalMoneyOut - prev.totalMoneyOut) /
                    prev.totalMoneyOut) *
                  100
                ).toFixed(2),
              )
            : 0,
        remainingGrowth:
          prev.remaining !== 0
            ? parseFloat(
                (
                  ((data.remaining - prev.remaining) /
                    Math.abs(prev.remaining)) *
                  100
                ).toFixed(2),
              )
            : 0,
      };
    });

    const finalData =
      trendsWithGrowth.length > limit
        ? trendsWithGrowth.slice(1)
        : trendsWithGrowth;

    res
      .status(200)
      .json({ success: true, count: finalData.length, data: finalData });
  } catch (error) {
    console.error("Error in getTrends:", error);
    res
      .status(500)
      .json({
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

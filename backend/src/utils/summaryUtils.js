const MonthlySummary = require("../models/MonthlySummary");
const Expense = require("../models/Expense");
const MoneyIn = require("../models/MoneyIn");
const mongoose = require("mongoose");

const updateMonthlySummary = async (userId, month) => {
  try {
    const startDate = new Date(`${month}-01`);
    const endDate = new Date(
      startDate.getFullYear(),
      startDate.getMonth() + 1,
      0,
      23,
      59,
      59,
      599,
    );

    const [expenseStats, moneyInStats, categoryStats] = await Promise.all([
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), month } },
        {
          $group: {
            _id: null,
            totalMoneyInFromExpenses: { $sum: "$moneyIn" },
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
        {
          $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } },
        },
      ]),
      Expense.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId), month } },
        {
          $group: {
            _id: { $ifNull: ["$category", "Uncategorized"] },
            totalAmount: {
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
            count: 1,
            _id: 0,
          },
        },
      ]),
    ]);

    const expStats = expenseStats[0] || {
      totalMoneyInFromExpenses: 0,
      totalMoneyOut: 0,
      totalExpenses: 0,
    };
    const minStats = moneyInStats[0] || { total: 0, count: 0 };

    const totalMoneyIn = expStats.totalMoneyInFromExpenses + minStats.total;
    const totalMoneyOut = expStats.totalMoneyOut;
    const remaining = totalMoneyIn - totalMoneyOut;

    await MonthlySummary.findOneAndUpdate(
      { userId, month },
      {
        totalMoneyIn,
        totalMoneyOut,
        remaining,
        totalExpenses: expStats.totalExpenses,
        moneyInCount: minStats.count || 0,
        expenseCount: expStats.totalExpenses || 0,
        categoryBreakdown: categoryStats,
        updatedAt: new Date(),
      },
      { upsert: true, new: true },
    );
  } catch (error) {
    console.error("Error updating monthly summary:", error);
  }
};

module.exports = { updateMonthlySummary };

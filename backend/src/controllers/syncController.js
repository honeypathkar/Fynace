const Expense = require("../models/Expense");
const MoneyIn = require("../models/MoneyIn");
const Category = require("../models/Category");

const syncData = async (req, res) => {
  try {
    const userId = req.userId;
    const { lastSyncTime } = req.query;

    // Convert lastSyncTime safely
    const since = lastSyncTime ? new Date(Number(lastSyncTime)) : new Date(0);

    // Fetch updated records
    const [expenses, moneyIn, categories] = await Promise.all([
      Expense.find({ userId, updatedAt: { $gt: since } }).lean(),
      MoneyIn.find({ userId, updatedAt: { $gt: since } }).lean(),
      Category.find({
        $or: [
          { userId, updatedAt: { $gt: since } },
          { isDefault: true, updatedAt: { $gt: since } },
        ],
      }).lean(),
    ]);

    console.log(
      `Sync for User ${userId}: Sending ${expenses.length} expenses, ${moneyIn.length} moneyIn, ${categories.length} categories since ${since.toISOString()}`,
    );

    // 🔥 Calculate correct next sync timestamp
    const allUpdatedAt = [
      ...expenses.map((e) => e.updatedAt),
      ...moneyIn.map((m) => m.updatedAt),
      ...categories.map((c) => c.updatedAt),
    ].filter(Boolean);

    const newTimestamp =
      allUpdatedAt.length > 0
        ? Math.max(...allUpdatedAt.map((date) => new Date(date).getTime()))
        : since.getTime(); // do NOT move timestamp forward if nothing changed

    res.status(200).json({
      success: true,
      timestamp: newTimestamp,
      data: {
        expenses,
        moneyIn,
        categories,
      },
    });
  } catch (error) {
    console.error("Sync Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Differential sync failed",
    });
  }
};

module.exports = {
  syncData,
};

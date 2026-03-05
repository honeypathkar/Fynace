const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

const syncData = async (req, res) => {
  try {
    const userId = req.userId;
    const { lastSyncTime } = req.query;

    const since = lastSyncTime ? new Date(Number(lastSyncTime)) : new Date(0);

    const [transactionsDocs, categories] = await Promise.all([
      Transaction.find({ userId, updatedAt: { $gt: since } })
        .populate("categoryId", "name")
        .lean(),
      Category.find({
        $or: [
          { userId, updatedAt: { $gt: since } },
          { isDefault: true, updatedAt: { $gt: since } },
        ],
      }).lean(),
    ]);

    const transactions = transactionsDocs.map((t) => ({
      ...t,
      amount: t.amount / 100, // Convert paise to rupees for sync response
      categoryName: t.categoryId ? t.categoryId.name : "",
      categoryId: t.categoryId ? t.categoryId._id : null,
    }));

    console.log(
      `Sync for User ${userId}: ${transactions.length} transactions, ${categories.length} categories since ${since.toISOString()}`,
    );

    const allUpdatedAt = [
      ...transactions.map((t) => t.updatedAt),
      ...categories.map((c) => c.updatedAt),
    ].filter(Boolean);

    const newTimestamp =
      allUpdatedAt.length > 0
        ? Math.max(...allUpdatedAt.map((date) => new Date(date).getTime()))
        : since.getTime();

    res.status(200).json({
      success: true,
      timestamp: newTimestamp,
      data: {
        transactions,
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

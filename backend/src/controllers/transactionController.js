const mongoose = require("mongoose");
const Transaction = require("../models/Transaction");
const Category = require("../models/Category");

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Convert paise (integer) → rupees (float) for API responses */
const toRupees = (paise) => paise / 100;

/** Convert rupees (float) → paise (integer) for storage */
const toPaise = (rupees) => Math.round(Number(rupees) * 100);

function getMonthBounds(monthStr) {
  // monthStr: "YYYY-MM"
  const [year, month] = monthStr.split("-").map(Number);
  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);
  return { start, end };
}

function currentMonthStr() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}

// ─── Create Transaction ───────────────────────────────────────────────────────

const createTransaction = async (req, res) => {
  try {
    const userId = req.userId;
    const {
      type,
      name,
      amount,
      categoryId,
      note,
      date,
      merchantName,
      upiId,
      qrData,
      upiIntent,
      watermelonId,
      isRecurring,
      frequency,
      isActive,
      lastRecurringDate,
    } = req.body;

    if (!type || !["income", "expense"].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'type must be "income" or "expense"',
      });
    }
    if (!name || !String(name).trim()) {
      return res
        .status(400)
        .json({ success: false, message: "name is required" });
    }
    if (amount === undefined || amount === null || isNaN(Number(amount))) {
      return res.status(400).json({
        success: false,
        message: "amount is required and must be a number",
      });
    }

    const txData = {
      userId,
      type,
      name: String(name).trim(),
      amount: toPaise(amount),
      categoryId: categoryId || null,
      note: note || "",
      date: date ? new Date(date) : new Date(),
      merchantName: merchantName || "",
      upiId: upiId || "",
      qrData: qrData || "",
      upiIntent: Boolean(upiIntent),
      watermelonId: watermelonId || "",
      isDeleted: false,
      isRecurring: Boolean(isRecurring),
      frequency: frequency || null,
      isActive: isActive !== undefined ? Boolean(isActive) : true,
      lastRecurringDate: lastRecurringDate ? new Date(lastRecurringDate) : null,
    };

    let transaction;
    if (watermelonId) {
      // Upsert based on watermelonId + userId
      transaction = await Transaction.findOneAndUpdate(
        { userId, watermelonId },
        { $set: txData },
        { upsert: true, new: true, runValidators: true },
      );
    } else {
      transaction = await Transaction.create(txData);
    }

    return res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: formatTransaction(transaction),
    });
  } catch (error) {
    console.error("createTransaction error:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create transaction",
    });
  }
};

// ─── Get Transactions (list with filters + cursor pagination) ─────────────────

const getTransactions = async (req, res) => {
  try {
    const userId = req.userId;
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const { type, categoryId, from, to, search, cursor } = req.query;

    const query = { userId, isDeleted: false };

    if (type && ["income", "expense"].includes(type)) query.type = type;
    if (categoryId) query.categoryId = new mongoose.Types.ObjectId(categoryId);
    if (from || to) {
      query.date = {};
      if (from) query.date.$gte = new Date(from);
      if (to) query.date.$lte = new Date(to);
    }
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { note: { $regex: search, $options: "i" } },
        { merchantName: { $regex: search, $options: "i" } },
      ];
    }
    if (cursor) {
      query.date = { ...(query.date || {}), $lt: new Date(cursor) };
    }

    const docs = await Transaction.find(query)
      .sort({ date: -1 })
      .limit(limit + 1)
      .populate("categoryId", "name")
      .lean();

    const hasMore = docs.length > limit;
    const results = hasMore ? docs.slice(0, limit) : docs;

    return res.status(200).json({
      success: true,
      count: results.length,
      hasMore,
      cursor: results.length > 0 ? results[results.length - 1].date : null,
      data: results.map(formatTransaction),
    });
  } catch (error) {
    console.error("getTransactions error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Update Transaction ───────────────────────────────────────────────────────

const updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;
    const {
      type,
      name,
      amount,
      categoryId,
      note,
      date,
      merchantName,
      upiId,
      isRecurring,
      frequency,
      isActive,
      lastRecurringDate,
    } = req.body;

    // Support update by either _id OR watermelonId
    const query = { userId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { watermelonId: id }];
    } else {
      query.watermelonId = id;
    }

    const tx = await Transaction.findOne(query);
    if (!tx)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    if (type && ["income", "expense"].includes(type)) tx.type = type;
    if (name) tx.name = String(name).trim();
    if (amount !== undefined) tx.amount = toPaise(amount);
    if (categoryId !== undefined) tx.categoryId = categoryId || null;
    if (note !== undefined) tx.note = note;
    if (date) tx.date = new Date(date);
    if (merchantName !== undefined) tx.merchantName = merchantName;
    if (upiId !== undefined) tx.upiId = upiId;
    if (isRecurring !== undefined) tx.isRecurring = Boolean(isRecurring);
    if (frequency !== undefined) tx.frequency = frequency;
    if (isActive !== undefined) tx.isActive = Boolean(isActive);
    if (lastRecurringDate !== undefined)
      tx.lastRecurringDate = lastRecurringDate
        ? new Date(lastRecurringDate)
        : null;

    await tx.save();

    return res.status(200).json({
      success: true,
      message: "Transaction updated",
      data: formatTransaction(tx),
    });
  } catch (error) {
    console.error("updateTransaction error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Delete Transaction (soft delete) ────────────────────────────────────────

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    // Support deletion by either _id OR watermelonId
    const query = { userId };
    if (mongoose.Types.ObjectId.isValid(id)) {
      query.$or = [{ _id: id }, { watermelonId: id }];
    } else {
      query.watermelonId = id;
    }

    const tx = await Transaction.findOne(query);
    if (!tx)
      return res
        .status(404)
        .json({ success: false, message: "Transaction not found" });

    tx.isDeleted = true;
    await tx.save();

    return res
      .status(200)
      .json({ success: true, message: "Transaction deleted" });
  } catch (error) {
    console.error("deleteTransaction error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Dashboard Summary ────────────────────────────────────────────────────────

const getDashboard = async (req, res) => {
  try {
    const userId = req.userId;
    const month = req.query.month || currentMonthStr();
    const { start, end } = getMonthBounds(month);

    const result = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          isDeleted: false,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    let income = 0,
      incomeCount = 0,
      expense = 0,
      expenseCount = 0;
    for (const row of result) {
      if (row._id === "income") {
        income = row.total;
        incomeCount = row.count;
      }
      if (row._id === "expense") {
        expense = row.total;
        expenseCount = row.count;
      }
    }

    return res.status(200).json({
      success: true,
      month,
      data: {
        income: toRupees(income),
        expense: toRupees(expense),
        balance: toRupees(income - expense),
        incomeCount,
        expenseCount,
        totalTransactions: incomeCount + expenseCount,
      },
    });
  } catch (error) {
    console.error("getDashboard error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Monthly Summary ──────────────────────────────────────────────────────────

const getMonthlySummary = async (req, res) => {
  try {
    const userId = req.userId;
    const { month } = req.params;

    const monthRegex = /^\d{4}-\d{2}$/;
    if (!monthRegex.test(month)) {
      return res
        .status(400)
        .json({ success: false, message: "month must be YYYY-MM" });
    }

    const { start, end } = getMonthBounds(month);

    const [summary, categoryBreakdown] = await Promise.all([
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: "$type",
            total: { $sum: "$amount" },
            count: { $sum: 1 },
          },
        },
      ]),
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            isDeleted: false,
            type: "expense",
            date: { $gte: start, $lt: end },
          },
        },
        {
          $group: {
            _id: "$categoryId",
            total: { $sum: "$amount" },
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
            categoryId: "$_id",
            categoryName: {
              $ifNull: [
                { $arrayElemAt: ["$category.name", 0] },
                "Uncategorized",
              ],
            },
            total: 1,
            count: 1,
            _id: 0,
          },
        },
        { $sort: { total: -1 } },
      ]),
    ]);

    let income = 0,
      expense = 0;
    for (const row of summary) {
      if (row._id === "income") income = row.total;
      if (row._id === "expense") expense = row.total;
    }

    return res.status(200).json({
      success: true,
      month,
      data: {
        income: toRupees(income),
        expense: toRupees(expense),
        balance: toRupees(income - expense),
        categoryBreakdown: categoryBreakdown.map((c) => ({
          ...c,
          total: toRupees(c.total),
        })),
      },
    });
  } catch (error) {
    console.error("getMonthlySummary error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Monthly Totals for Charts ────────────────────────────────────────────────

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
          income: {
            $sum: { $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0] },
          },
          expense: {
            $sum: { $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0] },
          },
          totalTransactions: { $sum: "$count" },
        },
      },
      { $sort: { _id: -1 } },
      { $limit: limit },
      { $sort: { _id: 1 } },
    ]);

    return res.status(200).json({
      success: true,
      count: results.length,
      data: results.map((r) => ({
        month: r._id,
        income: toRupees(r.income),
        expense: toRupees(r.expense),
        balance: toRupees(r.income - r.expense),
        totalTransactions: r.totalTransactions,
      })),
    });
  } catch (error) {
    console.error("getMonthlyTotals error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Category Distribution ────────────────────────────────────────────────────

const getCategoryDistribution = async (req, res) => {
  try {
    const userId = req.userId;
    const { month } = req.params; // "YYYY-MM" or "all-time"

    const match = {
      userId: new mongoose.Types.ObjectId(userId),
      isDeleted: false,
      type: "expense",
    };

    if (month && month !== "all-time" && month !== "all") {
      const { start, end } = getMonthBounds(month);
      match.date = { $gte: start, $lt: end };
    }

    const stats = await Transaction.aggregate([
      { $match: match },
      {
        $group: {
          _id: "$categoryId",
          total: { $sum: "$amount" },
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
          categoryId: "$_id",
          categoryName: {
            $ifNull: [{ $arrayElemAt: ["$category.name", 0] }, "Uncategorized"],
          },
          total: 1,
          count: 1,
          _id: 0,
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = stats.reduce((sum, s) => sum + s.total, 0);

    return res.status(200).json({
      success: true,
      month: month || "all-time",
      data: stats.map((s) => ({
        ...s,
        total: toRupees(s.total),
        percentage:
          grandTotal > 0
            ? parseFloat(((s.total / grandTotal) * 100).toFixed(2))
            : 0,
      })),
    });
  } catch (error) {
    console.error("getCategoryDistribution error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// ─── Format helper (paise → rupees for response) ──────────────────────────────
function formatTransaction(tx) {
  return {
    _id: tx._id,
    userId: tx.userId,
    type: tx.type,
    name: tx.name,
    amount: toRupees(tx.amount), // 12050 paise → 120.50 rupees
    categoryId: tx.categoryId,
    note: tx.note,
    date: tx.date,
    merchantName: tx.merchantName,
    upiId: tx.upiId,
    upiIntent: tx.upiIntent,
    isRecurring: tx.isRecurring || false,
    frequency: tx.frequency || null,
    isActive: tx.isActive !== false,
    lastRecurringDate: tx.lastRecurringDate,
    isDeleted: tx.isDeleted,
    createdAt: tx.createdAt,
    updatedAt: tx.updatedAt,
  };
}

// ─── Bulk Upload Transactions ────────────────────────────────────────────────
const bulkUploadTransactions = async (req, res) => {
  try {
    const { transactions } = req.body;
    const userId = req.userId;

    if (!Array.isArray(transactions) || transactions.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No transactions provided" });
    }

    const docs = transactions.map((t) => ({
      userId,
      type: t.type || (t.moneyIn > 0 ? "income" : "expense"),
      name: t.name || t.itemName || "Imported Transaction",
      amount: toPaise(
        t.amount || (t.moneyIn > 0 ? t.moneyIn : t.moneyOut) || 0,
      ),
      categoryId: t.categoryId || null,
      note: t.note || t.notes || "",
      date: t.date ? new Date(t.date) : new Date(),
      isRecurring: Boolean(t.isRecurring),
      frequency: t.frequency || null,
    }));

    const result = await Transaction.insertMany(docs);

    return res.status(200).json({
      success: true,
      count: result.length,
      message: `${result.length} transactions imported successfully`,
    });
  } catch (error) {
    console.error("bulkUploadTransactions error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getDashboard,
  getMonthlySummary,
  getMonthlyTotals,
  getCategoryDistribution,
  bulkUploadTransactions,
};

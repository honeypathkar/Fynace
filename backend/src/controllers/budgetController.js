const Budget = require("../models/Budget");
const Transaction = require("../models/Transaction");
const mongoose = require("mongoose");

const toRupees = (paise) => paise / 100;
const toPaise = (rupees) => Math.round(Number(rupees) * 100);

const currentMonthStr = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
};

const getBudgets = async (req, res) => {
  try {
    const userId = req.userId;
    const month = req.query.month || currentMonthStr();

    const budgets = await Budget.find({ userId, month })
      .populate("categoryId", "name")
      .lean();

    // Get actual spending for these categories in the same month
    const [year, monthNum] = month.split("-").map(Number);
    const start = new Date(year, monthNum - 1, 1);
    const end = new Date(year, monthNum, 1);

    const spending = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          type: "expense",
          isDeleted: false,
          date: { $gte: start, $lt: end },
        },
      },
      {
        $group: {
          _id: "$categoryId",
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const spendingMap = {};
    spending.forEach((s) => {
      if (s._id) spendingMap[s._id.toString()] = s.totalSpent;
    });

    const formattedBudgets = budgets.map((b) => ({
      _id: b._id,
      categoryId: b.categoryId?._id,
      categoryName: b.categoryId?.name || "Uncategorized",
      monthlyLimit: toRupees(b.monthlyLimit),
      totalSpent: toRupees(spendingMap[b.categoryId?._id?.toString()] || 0),
      month: b.month,
    }));

    res.status(200).json({ success: true, data: formattedBudgets });
  } catch (error) {
    console.error("getBudgets error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const setBudget = async (req, res) => {
  try {
    const userId = req.userId;
    const { categoryId, categoryName, monthlyLimit, month } = req.body;

    if ((!categoryId && !categoryName) || !monthlyLimit || !month) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields" });
    }

    let finalCategoryId = categoryId;
    if (!finalCategoryId && categoryName) {
      const Category = require("../models/Category");
      const category = await Category.findOne({
        name: categoryName,
        $or: [{ userId }, { isDefault: true }],
      });
      if (category) {
        finalCategoryId = category._id;
      } else {
        return res
          .status(404)
          .json({ success: false, message: "Category not found" });
      }
    }

    const budget = await Budget.findOneAndUpdate(
      { userId, categoryId: finalCategoryId, month },
      { monthlyLimit: toPaise(monthlyLimit) },
      { upsert: true, new: true, runValidators: true },
    );

    res.status(200).json({ success: true, data: budget });
  } catch (error) {
    console.error("setBudget error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

const deleteBudget = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.userId;

    const result = await Budget.findOneAndDelete({ _id: id, userId });
    if (!result) {
      return res
        .status(404)
        .json({ success: false, message: "Budget not found" });
    }

    res.status(200).json({ success: true, message: "Budget deleted" });
  } catch (error) {
    console.error("deleteBudget error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getBudgets,
  setBudget,
  deleteBudget,
};

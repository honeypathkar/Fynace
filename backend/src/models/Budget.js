const mongoose = require("mongoose");

const budgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    // Month this budget applies to: "YYYY-MM"
    month: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}$/,
    },
    // Monthly spending limit stored as integer paise (e.g. ₹5000 → 500000)
    monthlyLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    // Track which percentage thresholds have been notified this month
    // e.g. [50, 70, 80] means 50%, 70%, 80% alerts have already been sent
    notifiedThresholds: {
      type: [Number],
      default: [],
    },
  },
  { timestamps: true },
);

// One budget per user per category per month
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);

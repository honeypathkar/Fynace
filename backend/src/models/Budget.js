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
  },
  { timestamps: true },
);

// One budget per user per category per month
budgetSchema.index({ userId: 1, categoryId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("Budget", budgetSchema);

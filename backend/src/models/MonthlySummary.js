const mongoose = require("mongoose");

const monthlySummarySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  month: {
    type: String, // Format: YYYY-MM
    required: true,
  },
  totalMoneyIn: {
    type: Number,
    default: 0,
  },
  totalMoneyOut: {
    type: Number,
    default: 0,
  },
  remaining: {
    type: Number,
    default: 0,
  },
  totalExpenses: {
    type: Number,
    default: 0,
  },
  moneyInCount: {
    type: Number,
    default: 0,
  },
  expenseCount: {
    type: Number,
    default: 0,
  },
  categoryBreakdown: [
    {
      category: String,
      totalAmount: Number,
      count: Number,
    },
  ],
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Compound index for fast lookup
monthlySummarySchema.index({ userId: 1, month: 1 }, { unique: true });

module.exports = mongoose.model("MonthlySummary", monthlySummarySchema);

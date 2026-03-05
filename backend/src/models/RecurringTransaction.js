const mongoose = require("mongoose");

const recurringTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ["income", "expense"],
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    // Stored as integer paise (same as Transaction model)
    amount: {
      type: Number,
      required: true,
      min: 1,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    note: {
      type: String,
      default: "",
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly"],
      required: true,
    },
    nextRun: {
      type: Date,
      required: true,
      index: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

// Index for cron job: find all active recurring transactions due today
recurringTransactionSchema.index({ nextRun: 1, isActive: 1 });

module.exports = mongoose.model(
  "RecurringTransaction",
  recurringTransactionSchema,
);

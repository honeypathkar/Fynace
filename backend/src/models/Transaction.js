const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema(
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
    // Stored as integer paise (e.g. ₹120.50 → 12050) to avoid float precision errors
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      default: null,
    },
    note: {
      type: String,
      trim: true,
      default: "",
    },
    date: {
      type: Date,
      default: Date.now,
      index: true,
    },

    // UPI / QR payment metadata
    merchantName: {
      type: String,
      trim: true,
      default: "",
    },
    upiId: {
      type: String,
      trim: true,
      default: "",
    },
    qrData: {
      type: String,
      default: "",
    },
    upiIntent: {
      type: Boolean,
      default: false,
    },

    // WatermelonDB sync
    watermelonId: {
      type: String,
      default: "",
    },

    isDeleted: {
      type: Boolean,
      default: false,
    },
    // Recurring Transaction Fields
    isRecurring: {
      type: Boolean,
      default: false,
    },
    frequency: {
      type: String,
      enum: ["daily", "weekly", "monthly", "yearly", null],
      default: null,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastRecurringDate: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // auto-manages createdAt and updatedAt
  },
);

// ─── Indexes ──────────────────────────────────────────────────────────────────

// Primary query index: list transactions for a user sorted by date
transactionSchema.index({ userId: 1, date: -1 });

// Type-filtered queries (income / expense lists)
transactionSchema.index({ userId: 1, type: 1, date: -1 });

// Category-based queries (budget checks, category breakdown)
transactionSchema.index({ userId: 1, categoryId: 1, date: -1 });

// WatermelonDB sync: unique per user+device record — only enforced when watermelonId is actually set
transactionSchema.index(
  { userId: 1, watermelonId: 1 },
  { unique: true, partialFilterExpression: { watermelonId: { $gt: "" } } },
);

module.exports = mongoose.model("Transaction", transactionSchema);

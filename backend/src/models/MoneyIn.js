const mongoose = require("mongoose");

const moneyInSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
  amount: {
    type: Number,
    required: true,
    min: 0,
  },
  date: {
    type: Date,
    required: true,
    default: Date.now,
  },
  notes: {
    type: String,
    trim: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  isDeleted: {
    type: Boolean,
    default: false,
  },
});

// Update the updatedAt field before saving
moneyInSchema.pre("save", function (next) {
  this.updatedAt = Date.now();
  next();
});

// Compound index for efficient queries
moneyInSchema.index({ userId: 1, date: 1 });
moneyInSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("MoneyIn", moneyInSchema);

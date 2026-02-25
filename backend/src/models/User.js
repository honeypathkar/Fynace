const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  fullName: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
    index: true,
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
    index: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  authMethod: {
    type: String,
    enum: ["otp", "google", "password"],
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
    index: true,
  },
  userImage: {
    type: String,
  },
  currency: {
    type: String,
    default: "INR",
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  notificationSettings: {
    dailyReminder: { type: Boolean, default: true },
    monthlySummary: { type: Boolean, default: true },
    budgetAlerts: { type: Boolean, default: true },
    smartInsights: { type: Boolean, default: true },
  },
  devices: [
    {
      deviceId: { type: String, required: true },
      deviceName: { type: String },
      token: { type: String, required: true },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt field before saving
userSchema.pre("save", async function (next) {
  this.updatedAt = Date.now();

  // Hash password if modified
  if (this.isModified("password") && this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

// No explicit index calls needed here as they are defined in the schema fields

module.exports = mongoose.model("User", userSchema);

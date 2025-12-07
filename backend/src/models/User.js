const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true, // Allows multiple documents with null/undefined
  },
  phone: {
    type: String,
    trim: true,
    sparse: true,
  },
  password: {
    type: String,
    select: false, // Don't return password by default
  },
  authMethod: {
    type: String,
    enum: ['otp', 'google', 'password'],
    required: true,
  },
  googleId: {
    type: String,
    sparse: true,
  },
  otp: {
    code: String,
    expiresAt: Date,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
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
userSchema.pre('save', async function (next) {
  this.updatedAt = Date.now();

  // Hash password if modified
  if (!this.isModified('password')) {
    next();
  }
  
  if (this.password) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Index for faster queries
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ googleId: 1 });

module.exports = mongoose.model('User', userSchema);


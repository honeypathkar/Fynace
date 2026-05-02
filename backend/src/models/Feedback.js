const mongoose = require("mongoose");

const feedbackSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  type: {
    type: String,
    enum: ["Bug", "Feedback", "Idea"],
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  images: [
    {
      type: String, // Cloudinary URLs
    },
  ],
  status: {
    type: String,
    enum: ["Pending", "Reviewed", "Resolved"],
    default: "Pending",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Feedback", feedbackSchema);

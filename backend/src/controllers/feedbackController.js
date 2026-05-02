const Feedback = require("../models/Feedback");
const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

/**
 * Submit user feedback
 * POST /api/feedback/submit
 */
const submitFeedback = async (req, res) => {
  try {
    const { type, message, images } = req.body;
    const userId = req.user.id;

    if (!type || !message) {
      return res.status(400).json({
        success: false,
        message: "Type and message are required",
      });
    }

    const feedback = new Feedback({
      user: userId,
      type,
      message,
      images: images || [],
    });

    await feedback.save();

    // Notify Admins
    try {
      const admins = await User.find({ role: "admin", "devices.0": { $exists: true } });
      const adminTokens = admins.reduce((acc, admin) => {
        return acc.concat(admin.devices.map(d => d.token));
      }, []);

      if (adminTokens.length > 0) {
        await sendNotification(adminTokens, {
          title: `New ${type} Received!`,
          body: message.length > 50 ? message.substring(0, 47) + "..." : message,
          data: { url: "fynace://admin-panel" }
        });
      }
    } catch (notifError) {
      console.error("Admin notification failed:", notifError);
    }

    res.status(201).json({
      success: true,
      message: "Feedback submitted successfully",
      feedback,
    });
  } catch (error) {
    console.error("Error in submitFeedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

/**
 * Get all feedback (for admin usage, optional)
 * GET /api/feedback
 */
const getAllFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const feedback = await Feedback.find({ user: userId }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      feedback,
    });
  } catch (error) {
    console.error("Error in getAllFeedback:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

module.exports = {
  submitFeedback,
  getAllFeedback,
};

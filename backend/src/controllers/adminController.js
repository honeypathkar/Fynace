const User = require("../models/User");
const Feedback = require("../models/Feedback");
const { sendNotification } = require("../services/notificationService");

/**
 * Get all users
 * GET /api/admin/users
 */
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-otp").sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      users,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch users",
    });
  }
};

/**
 * Get all feedbacks
 * GET /api/admin/feedbacks
 */
const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "fullName email userImage")
      .sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      feedbacks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch feedbacks",
    });
  }
};

/**
 * Send notification to all users
 * POST /api/admin/send-multicast
 */
const sendBulkNotification = async (req, res) => {
  try {
    const { title, body, image, url, userIds } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        success: false,
        message: "Title and body are required",
      });
    }

    // Get device tokens, optionally filtered by userIds
    let query = { "devices.0": { $exists: true } };
    if (userIds && Array.isArray(userIds) && userIds.length > 0) {
      query._id = { $in: userIds };
    }

    const users = await User.find(query);
    const allTokens = users.reduce((acc, user) => {
      const userTokens = user.devices.map((d) => d.token);
      return acc.concat(userTokens);
    }, []);

    if (allTokens.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No registered device tokens found",
      });
    }

    const result = await sendNotification(allTokens, {
      title,
      body,
      image,
      data: { url },
    });

    res.status(200).json({
      success: true,
      message: `Notification sent to ${allTokens.length} devices`,
      result,
    });
  } catch (error) {
    console.error("Bulk notification error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to send notifications",
      error: error.message,
    });
  }
};

/**
 * Resolve feedback
 * PUT /api/admin/feedbacks/:id/resolve
 */
const resolveFeedback = async (req, res) => {
  try {
    const { id } = req.params;
    const feedback = await Feedback.findById(id).populate("user");

    if (!feedback) {
      return res.status(404).json({
        success: false,
        message: "Feedback not found",
      });
    }

    feedback.status = "Resolved";
    await feedback.save();

    // Notify the user
    if (feedback.user && feedback.user.devices && feedback.user.devices.length > 0) {
      try {
        const userTokens = feedback.user.devices.map((d) => d.token);
        await sendNotification(userTokens, {
          title: "Update on your feedback",
          body: "Your submitted feedback/bug has been marked as resolved. Thank you!",
          data: { url: "fynace://feedback-history" }, // Adjust if needed
        });
      } catch (notifError) {
        console.error("User notification failed:", notifError);
      }
    }

    res.status(200).json({
      success: true,
      message: "Feedback marked as resolved",
      feedback,
    });
  } catch (error) {
    console.error("Resolve feedback error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to resolve feedback",
    });
  }
};

module.exports = {
  getAllUsers,
  getAllFeedbacks,
  sendBulkNotification,
  resolveFeedback,
};

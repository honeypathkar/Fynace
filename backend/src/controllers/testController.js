const User = require("../models/User");
const { sendNotification } = require("../services/notificationService");

/**
 * Send test notification to users by email(s)
 * POST /api/test/send-notification
 * Body: { emails: ["email1@test.com", "email2@test.com"], title, body, image }
 */
const sendTestNotification = async (req, res) => {
  try {
    const { emails, email, title, body, image, url } = req.body;
    
    // Support both 'emails' (array) and 'email' (single string) for backward compatibility
    const targetEmails = emails || email;

    if (!targetEmails || !title || !body) {
      return res.status(400).json({
        success: false,
        message: "Email(s), title, and body are required",
      });
    }

    const emailList = Array.isArray(targetEmails) ? targetEmails : [targetEmails];
    const users = await User.find({ email: { $in: emailList } });

    if (users.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No users found with the provided email(s)",
      });
    }

    // Collect all tokens from all found users
    const allTokens = users.reduce((acc, user) => {
      const userTokens = user.devices?.map((d) => d.token).filter(Boolean) || [];
      return [...acc, ...userTokens];
    }, []);

    if (allTokens.length === 0) {
      return res.status(400).json({
        success: false,
        message: "None of the users have registered devices",
      });
    }

    const result = await sendNotification(allTokens, { title, body, image, data: { url } });

    res.status(200).json({
      success: true,
      message: `Notification sent successfully to ${users.length} users (${allTokens.length} devices)`,
      result,
    });
  } catch (error) {
    console.error("Error in sendTestNotification:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

module.exports = {
  sendTestNotification,
};

const admin = require("../config/firebase");

/**
 * Send a notification to specific devices
 * @param {Array} deviceTokens - Array of FCM tokens
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendNotification = async (deviceTokens, { title, body, data = {} }) => {
  if (!deviceTokens || deviceTokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
    },
    data: {
      ...data,
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for some handlers
    },
    tokens: deviceTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);

    if (response.failureCount > 0) {
      const failedTokens = [];
      response.responses.forEach((resp, idx) => {
        if (!resp.success) {
          failedTokens.push(deviceTokens[idx]);
          console.error(`Failed to send to token ${idx}:`, resp.error);
        }
      });
      // Optionally clean up failed tokens here
    }

    return response;
  } catch (error) {
    console.error("Error sending multicast message:", error);
  }
};

/**
 * Send a notification to a specific user (all their devices)
 * @param {Object} user - User document
 * @param {Object} payload - { title, body, data }
 */
const sendToUser = async (user, payload) => {
  const tokens = user.devices?.map((d) => d.token).filter(Boolean) || [];
  return sendNotification(tokens, payload);
};

module.exports = {
  sendNotification,
  sendToUser,
};

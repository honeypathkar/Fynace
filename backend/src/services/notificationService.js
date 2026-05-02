const admin = require("../config/firebase");

/**
 * Send a notification to specific devices
 * @param {Array} deviceTokens - Array of FCM tokens
 * @param {Object} payload - Notification payload { title, body, data }
 */
const sendNotification = async (deviceTokens, { title, body, image, data = {} }) => {
  if (!deviceTokens || deviceTokens.length === 0) return;

  const message = {
    notification: {
      title,
      body,
      ...(image && { image }),
    },
    data: {
      ...data,
      ...(image && { image }),
      click_action: "FLUTTER_NOTIFICATION_CLICK", // Standard for some handlers
    },
    tokens: deviceTokens,
  };

  try {
    const response = await admin.messaging().sendEachForMulticast(message);
    console.log(`Successfully sent ${response.successCount} notifications`);

    if (response.failureCount > 0) {
      // Tokens that failed can be handled here (e.g., removed from DB if they are invalid)
      // We are removing the loud console logs as requested
    }

    return response;
  } catch (error) {
    // Only log critical multicast errors
    if (error.code !== 'messaging/invalid-argument') {
      console.error("Multicast delivery failed:", error.message);
    }
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

const admin = require("firebase-admin");

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  try {
    serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT, "base64").toString(
        "utf-8",
      ),
    );
  } catch (error) {
    console.error(
      "❌ Failed to parse FIREBASE_SERVICE_ACCOUNT env var:",
      error,
    );
  }
}

if (!serviceAccount) {
  try {
    serviceAccount = require("../middleware/fynace-new-firebase-adminsdk-fbsvc-e683271b1a.json");
  } catch (error) {
    console.warn(
      "⚠️ Service account JSON file not found, skipping initialization",
    );
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  console.log("🔥 Firebase Admin SDK Initialized");
}

module.exports = admin;

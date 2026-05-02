const express = require("express");
const router = express.Router();
const { sendTestNotification } = require("../controllers/testController");

// Test notification route
router.post("/send-notification", sendTestNotification);

module.exports = router;

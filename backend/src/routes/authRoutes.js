const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const {
  checkUser,
  sendOTPForLogin,
  verifyOTP,
  googleLoginRegister,
  getProfile,
  updateProfile,
  updateFCMToken,
} = require("../controllers/authController");
const { authenticate } = require("../middleware/auth");

// Check User
router.post(
  "/check-user",
  [body("email").isEmail().withMessage("Valid email is required")],
  checkUser,
);

// Send OTP
router.post(
  "/otp/send",
  [
    body("email").isEmail().withMessage("Valid email is required"),
    body("fullName").optional().trim(),
  ],
  sendOTPForLogin,
);

// Verify OTP
router.post(
  "/otp/verify",
  [
    body("otp").isLength({ min: 4, max: 4 }).isNumeric(),
    body("email").isEmail().withMessage("Valid email is required"),
  ],
  verifyOTP,
);

// Google Sign-In/Register
router.post("/google", [body("idToken").notEmpty()], googleLoginRegister);

// Get profile (protected)
router.get("/profile", authenticate, getProfile);

// Update profile (protected)
router.put(
  "/profile",
  authenticate,
  [
    body("fullName").optional().trim().notEmpty(),
    body("email").optional().isEmail(),
    body("phone").optional().isMobilePhone(),
  ],
  updateProfile,
);

// Update FCM Token (protected)
router.post("/fcm-token", authenticate, updateFCMToken);

module.exports = router;

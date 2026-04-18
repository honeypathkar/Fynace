const User = require("../models/User");
const { generateOTP, sendOTP } = require("../utils/otpService");
const { generateToken } = require("../utils/jwt");
const { OAuth2Client } = require("google-auth-library");
const jwt = require("jsonwebtoken");

// Initialize Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Check if user exists
const checkUser = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res
        .status(400)
        .json({ success: false, message: "Email is required" });
    }

    const user = await User.findOne({ email });
    res.status(200).json({
      success: true,
      exists: !!user,
    });
  } catch (error) {
    console.error("Error in checkUser:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send OTP for login/register
const sendOTPForLogin = async (req, res) => {
  try {
    const { email, fullName } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required to send OTP",
      });
    }

    // Generate 4-digit OTP
    const otp = generateOTP();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

    // Find or create user
    let user = await User.findOne({ email });

    if (user) {
      // Update OTP for existing user
      user.otp = {
        code: otp,
        expiresAt,
      };
      user.authMethod = "otp";
      await user.save();
    } else {
      // If new user, fullName is required
      if (!fullName) {
        return res.status(400).json({
          success: false,
          userNotFound: true,
          message: "Full name is required for new registration",
        });
      }

      // Create new user (unverified until OTP is verified)
      user = await User.create({
        email,
        fullName,
        authMethod: "otp",
        otp: {
          code: otp,
          expiresAt,
        },
        isVerified: false,
      });
    }

    // Send OTP via email
    await sendOTP(email, otp);

    res.status(200).json({
      success: true,
      message: "OTP sent successfully",
      userId: user._id,
    });
  } catch (error) {
    console.error("Error in sendOTPForLogin:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to send OTP",
    });
  }
};

// Verify OTP and login
const verifyOTP = async (req, res) => {
  try {
    const { otp, email } = req.body;

    if (!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // Find user
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Check if OTP exists and is valid
    if (!user.otp || !user.otp.code) {
      return res.status(400).json({
        success: false,
        message: "No OTP found. Please request a new OTP.",
      });
    }

    if (user.otp.code !== otp) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    if (new Date() > user.otp.expiresAt) {
      return res.status(400).json({
        success: false,
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    // Verify user and clear OTP
    user.isVerified = true;
    user.otp = undefined;
    await user.save();

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateToken(user._id);

    res.status(200).json({
      success: true,
      message: "OTP verified successfully",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        notificationSettings: user.notificationSettings,
        authMethod: user.authMethod,
      },
    });
  } catch (error) {
    console.error("Error in verifyOTP:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to verify OTP",
    });
  }
};

// Google login/register in one function
const googleLoginRegister = async (req, res) => {
  const { idToken } = req.body;
  if (!idToken) {
    return res.status(400).json({ message: "ID token is required" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, name, picture, sub: googleId } = payload;

    let user = await User.findOne({ email });
    if (!user) {
      // User doesn't exist, create a new one
      user = new User({
        fullName: name,
        email,
        googleId,
        userImage: picture,
        authMethod: "google",
        isVerified: true,
      });
      await user.save();
    }

    // Generate JWT tokens
    const { accessToken, refreshToken } = generateToken(user._id);

    // Respond with token and user info
    res.status(200).json({
      success: true,
      message: "Google login/register successful",
      token: accessToken,
      refreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Google Auth Error:", error);
    res.status(401).json({ error: "Invalid Google token" });
  }
};

// Get current user profile
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-otp");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        authMethod: user.authMethod,
        currency: user.currency,
        notificationSettings: user.notificationSettings,
        isVerified: user.isVerified,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error in getProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get profile",
    });
  }
};

// Update user profile
const updateProfile = async (req, res) => {
  try {
    const { fullName, email, phone, currency, notificationSettings } = req.body;

    const user = await User.findById(req.userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    if (fullName) user.fullName = fullName;
    if (email) user.email = email;
    if (phone) user.phone = phone;
    if (currency) user.currency = currency;
    if (notificationSettings) {
      user.notificationSettings = {
        ...(user.notificationSettings
          ? JSON.parse(JSON.stringify(user.notificationSettings))
          : {}),
        ...notificationSettings,
      };
      user.markModified("notificationSettings");
    }

    await user.save();

    res.status(200).json({
      success: true,
      message: "Profile updated successfully",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        notificationSettings: user.notificationSettings,
        authMethod: user.authMethod,
      },
    });
  } catch (error) {
    console.error("Error in updateProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update profile",
    });
  }
};

// Update FCM Token for a device
const updateFCMToken = async (req, res) => {
  try {
    const { deviceId, deviceName, token } = req.body;
    const userId = req.userId;

    if (!deviceId || !token) {
      return res.status(400).json({
        success: false,
        message: "deviceId and token are required",
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // Initialize devices array if it doesn't exist
    if (!user.devices) {
      user.devices = [];
    }

    // Remove any entries that share the same FCM token (stale deviceId from reinstalls, etc.)
    // AND remove any other entries for this deviceId — we'll re-add below cleanly.
    user.devices = user.devices.filter(
      (d) => d.token !== token && d.deviceId !== deviceId,
    );

    // Add the device with a fresh, clean entry (upsert by filtering out old + pushing new)
    user.devices.push({
      deviceId,
      deviceName: deviceName || "Unknown Device",
      token,
      updatedAt: Date.now(),
    });

    console.log(
      `✅ Device registered: ${deviceId} | Total devices: ${user.devices.length}`,
    );

    await user.save();

    res.status(200).json({
      success: true,
      message: "FCM token updated successfully",
    });
  } catch (error) {
    console.error("Error in updateFCMToken:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update FCM token",
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken: providedToken } = req.body;

    if (!providedToken) {
      return res.status(400).json({
        success: false,
        message: "Refresh token is required",
      });
    }

    // Verify refresh token
    const decoded = jwt.verify(providedToken, process.env.JWT_SECRET);

    if (!decoded.isRefreshToken) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }

    // Get user from database
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found",
      });
    }

    // Generate new tokens
    const { accessToken, refreshToken: newRefreshToken } = generateToken(
      user._id,
    );

    res.status(200).json({
      success: true,
      token: accessToken,
      accessToken: accessToken, // Support both formats
      refreshToken: newRefreshToken,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        phone: user.phone,
        currency: user.currency,
        notificationSettings: user.notificationSettings,
        authMethod: user.authMethod,
      },
    });
  } catch (error) {
    console.error("Error in refreshToken:", error);
    res.status(401).json({
      success: false,
      message: "Invalid or expired refresh token",
    });
  }
};

module.exports = {
  checkUser,
  sendOTPForLogin,
  verifyOTP,
  googleLoginRegister,
  getProfile,
  updateProfile,
  updateFCMToken,
  refreshToken,
};

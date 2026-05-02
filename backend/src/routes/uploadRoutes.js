const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const { authenticate: auth } = require("../middleware/auth");

/**
 * Upload multiple images to Cloudinary
 * POST /api/upload
 */
router.post("/", auth, upload.array("images", 5), (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }
    const imageUrls = req.files.map((file) => file.path);
    res.status(200).json({
      success: true,
      images: imageUrls,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to upload images",
      error: error.message,
    });
  }
});

module.exports = router;

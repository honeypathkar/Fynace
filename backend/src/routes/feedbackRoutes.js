const express = require("express");
const router = express.Router();
const {
  submitFeedback,
  getAllFeedback,
} = require("../controllers/feedbackController");
const { authenticate: auth } = require("../middleware/auth");

router.post("/submit", auth, submitFeedback);
router.get("/", auth, getAllFeedback);

module.exports = router;

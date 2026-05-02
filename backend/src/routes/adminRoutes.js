const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  getAllFeedbacks,
  sendBulkNotification,
  resolveFeedback,
} = require("../controllers/adminController");
const { authenticate: auth } = require("../middleware/auth");
const isAdmin = require("../middleware/admin");

// Apply auth and isAdmin middleware to all routes in this router
router.use(auth);
router.use(isAdmin);

router.get("/users", getAllUsers);
router.get("/feedbacks", getAllFeedbacks);
router.put("/feedbacks/:id/resolve", resolveFeedback);
router.post("/send-multicast", sendBulkNotification);

module.exports = router;

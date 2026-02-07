const express = require("express");
const router = express.Router();
const landingController = require("../controllers/landingController");

// POST /api/landing/early-access
router.post("/early-access", landingController.handleEarlyAccess);

module.exports = router;

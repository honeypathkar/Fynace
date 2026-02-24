const express = require("express");
const router = express.Router();
const { syncData } = require("../controllers/syncController");
const { authenticate } = require("../middleware/auth");

router.get("/", authenticate, syncData);

module.exports = router;

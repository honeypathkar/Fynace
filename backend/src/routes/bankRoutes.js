const express = require("express");
const router = express.Router();
const bankController = require("../controllers/bankController");

router.get("/", bankController.getAllBanks);
router.post("/seed", bankController.seedBanks);

module.exports = router;

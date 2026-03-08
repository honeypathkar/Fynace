const express = require("express");
const router = express.Router();
const { authenticate } = require("../middleware/auth");
const {
  getBudgets,
  setBudget,
  deleteBudget,
} = require("../controllers/budgetController");

router.use(authenticate);

// GET /api/budgets?month=YYYY-MM
router.get("/", getBudgets);

// POST /api/budgets
router.post("/", setBudget);

// DELETE /api/budgets/:id
router.delete("/:id", deleteBudget);

module.exports = router;

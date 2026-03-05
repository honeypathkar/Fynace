const express = require("express");
const router = express.Router();
const { body, param } = require("express-validator");
const { authenticate } = require("../middleware/auth");
const {
  createTransaction,
  getTransactions,
  updateTransaction,
  deleteTransaction,
  getDashboard,
  getMonthlySummary,
  getMonthlyTotals,
  getCategoryDistribution,
  bulkUploadTransactions,
} = require("../controllers/transactionController");

router.use(authenticate);

// ─── Bulk Operations ─────────────────────────────────────────────────────────

// POST /api/transactions/upload-excel
router.post("/upload-excel", bulkUploadTransactions);

// ─── Dashboard & Analytics ────────────────────────────────────────────────────

// GET /api/transactions/dashboard?month=YYYY-MM
router.get("/dashboard", getDashboard);

// GET /api/transactions/monthly-totals?limit=12
router.get("/monthly-totals", getMonthlyTotals);

// GET /api/transactions/summary/:month  (YYYY-MM)
router.get(
  "/summary/:month",
  [
    param("month")
      .matches(/^\d{4}-\d{2}$/)
      .withMessage("month must be YYYY-MM"),
  ],
  getMonthlySummary,
);

// GET /api/transactions/category-distribution/:month  (YYYY-MM or all-time)
router.get("/category-distribution/:month", getCategoryDistribution);

// ─── CRUD ─────────────────────────────────────────────────────────────────────

// GET /api/transactions?type=expense&categoryId=&from=&to=&search=&cursor=&limit=
router.get("/", getTransactions);

// POST /api/transactions
router.post(
  "/",
  [
    body("type")
      .isIn(["income", "expense"])
      .withMessage('type must be "income" or "expense"'),
    body("name").trim().notEmpty().withMessage("name is required"),
    body("amount").isNumeric().withMessage("amount must be a number"),
    body("categoryId").optional({ nullable: true }),
    body("note").optional().trim(),
    body("date").optional().isISO8601().withMessage("date must be ISO 8601"),
    body("upiIntent").optional().isBoolean(),
  ],
  createTransaction,
);

// PUT /api/transactions/:id
router.put(
  "/:id",
  [
    param("id").notEmpty().withMessage("transaction id is required"),
    body("type").optional().isIn(["income", "expense"]),
    body("name").optional().trim().notEmpty(),
    body("amount").optional().isNumeric(),
    body("date").optional().isISO8601(),
  ],
  updateTransaction,
);

// DELETE /api/transactions/:id
router.delete(
  "/:id",
  [param("id").notEmpty().withMessage("transaction id is required")],
  deleteTransaction,
);

module.exports = router;

const express = require("express");
const router = express.Router();
const {
  runDailyReminders,
  runBudgetAlerts,
  runInactivityNudges,
  runSmartInsights,
  runMonthlySummaries,
} = require("../workers/notificationWorker");

// Middleware to verify Vercel Cron Secret
const verifyCronSecret = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (
    process.env.NODE_ENV === "production" &&
    authHeader !== `Bearer ${process.env.CRON_SECRET}`
  ) {
    return res.status(401).json({ success: false, message: "Unauthorized" });
  }
  next();
};

router.use(verifyCronSecret);

router.get("/daily-reminders", async (req, res) => {
  try {
    await runDailyReminders();
    res.json({ success: true, message: "Daily reminders triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/budget-alerts", async (req, res) => {
  try {
    await runBudgetAlerts();
    res.json({ success: true, message: "Budget alerts triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/inactivity-nudges", async (req, res) => {
  try {
    await runInactivityNudges();
    res.json({ success: true, message: "Inactivity nudges triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/smart-insights", async (req, res) => {
  try {
    await runSmartInsights();
    res.json({ success: true, message: "Smart insights triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get("/monthly-summaries", async (req, res) => {
  try {
    await runMonthlySummaries();
    res.json({ success: true, message: "Monthly summaries triggered" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

module.exports = router;

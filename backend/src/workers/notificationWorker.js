const cron = require("node-cron");
const User = require("../models/User");
const Expense = require("../models/Expense");
const MonthlySummary = require("../models/MonthlySummary");
const { sendToUser } = require("../services/notificationService");

const getMonthString = (date) => {
  const d = new Date(date);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
};

/**
 * Logic for Daily Reminders
 */
const runDailyReminders = async () => {
  console.log("⏰ Running Daily Expense Reminders...");
  const users = await User.find({
    "notificationSettings.dailyReminder": true,
  });

  for (const user of users) {
    await sendToUser(user, {
      title: "Daily Reminder 💸",
      body: "Don't forget to log your expenses for today!",
      data: { screen: "Expenses" },
    });
  }
};

/**
 * Logic for Budget Alerts
 */
const runBudgetAlerts = async () => {
  console.log("⏰ Running Budget Alerts...");
  const users = await User.find({
    "notificationSettings.budgetAlerts": true,
  });

  const currentMonth = getMonthString(new Date());

  for (const user of users) {
    const summary = await MonthlySummary.findOne({
      userId: user._id,
      month: currentMonth,
    });

    if (summary && summary.categoryBreakdown.length > 0) {
      const topCategory = [...summary.categoryBreakdown].sort(
        (a, b) => b.totalAmount - a.totalAmount,
      )[0];

      if (topCategory && topCategory.totalAmount > 0) {
        await sendToUser(user, {
          title: "Budget Alert ⚠️",
          body: `You've spent the most on "${topCategory.category}" this month. Keep an eye on your limits!`,
          data: { screen: "Expenses" },
        });
      }
    }
  }
};

/**
 * Logic for Inactivity Congrats
 */
const runInactivityNudges = async () => {
  console.log("⏰ Running Inactivity Congrats...");
  const users = await User.find({
    "notificationSettings.dailyReminder": true,
  });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const user of users) {
    const recentExpense = await Expense.findOne({
      userId: user._id,
      date: { $gte: oneWeekAgo },
    });

    if (!recentExpense) {
      await sendToUser(user, {
        title: "Great Job! 🏆",
        body: "You haven't added any expenses this week! You did a really good job managing your budget. Keep it up!",
        data: { screen: "Home" },
      });
    }
  }
};

/**
 * Logic for Smart Insights
 */
const runSmartInsights = async () => {
  console.log("⏰ Running Smart Insights...");
  const users = await User.find({
    "notificationSettings.smartInsights": true,
  });

  for (const user of users) {
    await sendToUser(user, {
      title: "Smart Insights 💡",
      body: "We've analyzed your spending patterns! Check out your weekly insights.",
      data: { screen: "Home" },
    });
  }
};

/**
 * Logic for Monthly Summaries
 */
const runMonthlySummaries = async () => {
  console.log("⏰ Running Monthly Summary Nudges...");
  const users = await User.find({
    "notificationSettings.monthlySummary": true,
  });

  for (const user of users) {
    await sendToUser(user, {
      title: "Monthly Review 📊",
      body: "The month is ending soon! Review your spending and stay on track.",
      data: { screen: "Expenses" },
    });
  }
};

// For local development, keep the cron scheduler
const initWorkers = () => {
  if (process.env.NODE_ENV !== "production") {
    cron.schedule("0 21 * * *", runDailyReminders);
    cron.schedule("0 10 27 * *", runMonthlySummaries);
    cron.schedule("0 10 * * 1", runBudgetAlerts);
    cron.schedule("0 10 * * 3", runSmartInsights);
    cron.schedule("0 18 * * 0", runInactivityNudges);
    console.log("👷 Local Notification Workers Started");
  } else {
    console.log(
      "👷 Production: Notification workers should be triggered via Vercel Cron",
    );
  }
};

module.exports = {
  initWorkers,
  runDailyReminders,
  runBudgetAlerts,
  runInactivityNudges,
  runSmartInsights,
  runMonthlySummaries,
};

const cron = require("node-cron");
const mongoose = require("mongoose");
const User = require("../models/User");
const Transaction = require("../models/Transaction");
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
  const users = await User.find({ "notificationSettings.budgetAlerts": true });
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  for (const user of users) {
    const breakdown = await Transaction.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(user._id),
          type: "expense",
          isDeleted: false,
          date: { $gte: monthStart },
        },
      },
      { $group: { _id: "$categoryId", total: { $sum: "$amount" } } },
      { $sort: { total: -1 } },
      { $limit: 1 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      {
        $project: {
          name: {
            $ifNull: [{ $arrayElemAt: ["$cat.name", 0] }, "Uncategorized"],
          },
          total: 1,
        },
      },
    ]);

    if (breakdown.length > 0 && breakdown[0].total > 0) {
      const top = breakdown[0];
      await sendToUser(user, {
        title: "Budget Alert ⚠️",
        body: `You've spent the most on "${top.name}" this month. Keep an eye on your limits!`,
        data: { screen: "Transactions" },
      });
    }
  }
};

/**
 * Logic for Inactivity Congrats
 */
const runInactivityNudges = async () => {
  console.log("⏰ Running Inactivity Congrats...");
  const users = await User.find({ "notificationSettings.dailyReminder": true });

  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

  for (const user of users) {
    const recentTx = await Transaction.findOne({
      userId: user._id,
      isDeleted: false,
      date: { $gte: oneWeekAgo },
    });

    if (!recentTx) {
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
 * Logic for Recurring Transactions
 */
const processRecurringTransactions = async () => {
  console.log("⏰ Processing Recurring Transactions...");
  const recurringTemplates = await Transaction.find({
    isRecurring: true,
    isActive: true,
    isDeleted: false,
  });

  const now = new Date();

  for (const template of recurringTemplates) {
    try {
      let lastDate = template.lastRecurringDate || template.date;
      let nextDate = new Date(lastDate);

      // Determine next date based on frequency
      const incrementDate = (date, freq) => {
        const d = new Date(date);
        if (freq === "daily") d.setDate(d.getDate() + 1);
        else if (freq === "weekly") d.setDate(d.getDate() + 7);
        else if (freq === "monthly") d.setMonth(d.getMonth() + 1);
        else if (freq === "yearly") d.setFullYear(d.getFullYear() + 1);
        return d;
      };

      nextDate = incrementDate(lastDate, template.frequency);

      // Create instances if nextDate <= now
      let instancesCreated = 0;
      while (nextDate <= now && instancesCreated < 5) {
        // Create new transaction instance
        const newTxData = {
          userId: template.userId,
          type: template.type,
          name: template.name,
          amount: template.amount,
          categoryId: template.categoryId,
          note: template.note,
          date: nextDate,
          merchantName: template.merchantName,
          upiId: template.upiId,
          isRecurring: false, // Instances themselves are not templates
          isDeleted: false,
        };

        await Transaction.create(newTxData);

        // Update lastDate and calculate nextDate for potential catch-up
        lastDate = new Date(nextDate);
        nextDate = incrementDate(lastDate, template.frequency);
        instancesCreated++;
      }

      if (instancesCreated > 0) {
        template.lastRecurringDate = lastDate;
        await template.save();
        console.log(
          `✅ Created ${instancesCreated} instances for recurring TX: ${template.name}`,
        );

        // Send notification to user
        const user = await User.findById(template.userId);
        if (user && user.notificationSettings?.pushNotificationsEnabled) {
          await sendToUser(user, {
            title:
              template.type === "expense"
                ? "Recurring Expense 💸"
                : "Recurring Income 💰",
            body: `Automatically logged "${template.name}" for ₹${(template.amount / 100).toFixed(2)}.`,
            data: { screen: "Expenses" },
          });
        }
      }
    } catch (err) {
      console.error(
        `Error processing recurring template ${template._id}:`,
        err,
      );
    }
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
      data: { screen: "Transactions" },
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
    // Process recurring transactions daily at 1 AM
    cron.schedule("0 1 * * *", processRecurringTransactions);
    console.log("👷 Local Workers Started");
  } else {
    console.log("👷 Production: Workers should be triggered via Vercel Cron");
  }
};
module.exports = {
  initWorkers,
  runDailyReminders,
  runBudgetAlerts,
  runInactivityNudges,
  runSmartInsights,
  runMonthlySummaries,
  processRecurringTransactions,
};

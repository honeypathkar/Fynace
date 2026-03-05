/**
 * Migration script: Expense → Transaction
 *
 * Run with:
 *   node src/scripts/migrateExpenses.js
 *
 * Dry-run (logs counts, no inserts):
 *   DRY_RUN=true node src/scripts/migrateExpenses.js
 */

require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const Expense = require("../models/Expense");
const { resolveCategoryId } = require("../utils/categoryUtils");

const DRY_RUN = process.env.DRY_RUN === "true";
const BATCH_SIZE = 200;

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("✅ Connected to MongoDB");
  console.log(
    DRY_RUN
      ? "🔍 DRY RUN — no inserts will happen\n"
      : "🚀 LIVE RUN — inserting into transactions\n",
  );

  const col = mongoose.connection.collection("transactions");
  const total = await Expense.countDocuments({ isDeleted: { $ne: true } });
  console.log(`📦 Total expenses to migrate: ${total}`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  let skip = 0;

  while (skip < total) {
    const batch = await Expense.find({ isDeleted: { $ne: true } })
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    for (const expense of batch) {
      try {
        if (!DRY_RUN) {
          // Skip if already migrated (idempotent via sourceId)
          const existing = await col.findOne({
            sourceId: expense._id.toString(),
          });
          if (existing) {
            skipped++;
            continue;
          }

          const categoryId = await resolveCategoryId(
            expense.category,
            expense.userId,
          );
          const amountPaise = Math.round((expense.amount || 0) * 100);
          const now = new Date();

          // Resolve date: old Expense model often had no date — only a month string "YYYY-MM"
          let resolvedDate = expense.date || null;
          if (!resolvedDate && expense.month) {
            const [yr, mo] = expense.month.split("-").map(Number);
            resolvedDate = new Date(yr, mo - 1, 1, 12, 0, 0); // 1st of that month, noon
          }
          resolvedDate = resolvedDate || expense.createdAt || now;

          // Insert via native driver to avoid Mongoose timestamps conflict
          await col.insertOne({
            userId: expense.userId,
            type: "expense",
            name: expense.itemName || expense.category || "Expense",
            amount: amountPaise,
            categoryId: categoryId || null,
            note: expense.notes || "",
            date: resolvedDate,
            merchantName: "",
            upiId: "",
            qrData: "",
            upiIntent: false,
            watermelonId: "",
            isDeleted: false,
            sourceId: expense._id.toString(), // dedup key for idempotency
            createdAt: expense.createdAt || now,
            updatedAt: expense.updatedAt || now,
          });
        }
        migrated++;
      } catch (err) {
        errors++;
        console.error(
          `❌ Error migrating expense ${expense._id}:`,
          err.message,
        );
      }
    }

    skip += BATCH_SIZE;
    console.log(`  Processed ${Math.min(skip, total)}/${total}...`);
  }

  console.log("\n─────── Migration Summary ───────");
  console.log(`✅ Migrated : ${migrated}`);
  console.log(`⏭️  Skipped  : ${skipped}`);
  console.log(`❌ Errors   : ${errors}`);
  if (DRY_RUN) console.log("\n(DRY RUN — no data was written)");

  await mongoose.disconnect();
  process.exit(0);
}

run().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});

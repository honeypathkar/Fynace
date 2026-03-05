/**
 * Migration script: MoneyIn → Transaction
 *
 * Run with:
 *   node src/scripts/migrateMoneyIn.js
 *
 * Dry-run (logs counts, no inserts):
 *   DRY_RUN=true node src/scripts/migrateMoneyIn.js
 */

require("dotenv").config({
  path: require("path").join(__dirname, "../../.env"),
});
const mongoose = require("mongoose");
const MoneyIn = require("../models/MoneyIn");

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
  const total = await MoneyIn.countDocuments({ isDeleted: { $ne: true } });
  console.log(`📦 Total MoneyIn records to migrate: ${total}`);

  let migrated = 0;
  let skipped = 0;
  let errors = 0;
  let skip = 0;

  while (skip < total) {
    const batch = await MoneyIn.find({ isDeleted: { $ne: true } })
      .skip(skip)
      .limit(BATCH_SIZE)
      .lean();

    for (const record of batch) {
      try {
        if (!DRY_RUN) {
          // Skip if already migrated (idempotent)
          const existing = await col.findOne({
            sourceId: record._id.toString(),
          });
          if (existing) {
            skipped++;
            continue;
          }

          const amountPaise = Math.round((record.amount || 0) * 100);
          const now = new Date();

          // Insert via native driver to avoid Mongoose timestamps conflict
          await col.insertOne({
            userId: record.userId,
            type: "income",
            name: record.notes || "Income",
            amount: amountPaise,
            categoryId: null, // MoneyIn had no category
            note: record.notes || "",
            date: record.date || record.createdAt || now,
            merchantName: "",
            upiId: "",
            qrData: "",
            upiIntent: false,
            watermelonId: "",
            isDeleted: false,
            sourceId: record._id.toString(), // dedup key
            createdAt: record.createdAt || now,
            updatedAt: record.updatedAt || now,
          });
        }
        migrated++;
      } catch (err) {
        errors++;
        console.error(`❌ Error migrating MoneyIn ${record._id}:`, err.message);
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

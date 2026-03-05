const Category = require("../models/Category");

/**
 * Resolve a category name to a Category ObjectId.
 *
 * Lookup order:
 *  1. User-specific category matching name + userId
 *  2. Global default category matching name (userId: null)
 *  3. Returns null if nothing matched — never throws, so migration keeps going.
 *
 * @param {string} name        - Category name string (e.g. "Food")
 * @param {ObjectId|string} userId
 * @returns {ObjectId|null}
 */
async function resolveCategoryId(name, userId) {
  if (!name || !name.trim()) return null;

  const trimmedName = name.trim();

  // 1. User-specific category
  const userCat = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    userId,
  })
    .select("_id")
    .lean();

  if (userCat) return userCat._id;

  // 2. Global default category
  const defaultCat = await Category.findOne({
    name: { $regex: new RegExp(`^${trimmedName}$`, "i") },
    isDefault: true,
  })
    .select("_id")
    .lean();

  return defaultCat ? defaultCat._id : null;
}

module.exports = { resolveCategoryId };

const IST_OFFSET = 5.5 * 60 * 60 * 1000; // 5 hours 30 minutes in milliseconds

/**
 * Converts a UTC date to IST-shifted UTC date for storage.
 * This ensures that when MongoDB/aggregations use UTC, they see the IST day.
 */
const toIST = (date) => {
  if (!date) return new Date(Date.now() + IST_OFFSET);
  const d = new Date(date);
  // Check if it's already a shifted date (crude check: if it's in the future relative to now by ~5.5h)
  // Actually, better to just shift it if we know the source is UTC.
  return new Date(d.getTime() + IST_OFFSET);
};

module.exports = {
  IST_OFFSET,
  toIST
};

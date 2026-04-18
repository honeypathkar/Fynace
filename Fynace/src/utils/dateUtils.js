export const IST_OFFSET = 5.5 * 60 * 60 * 1000;

/**
 * Returns the current timestamp shifted by 5.5 hours to represent IST in UTC storage.
 */
export const getISTNow = () => Date.now() + IST_OFFSET;

/**
 * Shifts a given date/timestamp by 5.5 hours.
 */
export const toIST = (date) => {
  const d = date ? new Date(date).getTime() : Date.now();
  return d + IST_OFFSET;
};

/**
 * Formats a date string for display, accounting for the IST shift if needed.
 * But for display on device, usually we want to UN-SHIFT it if we stored it shifted.
 * However, the user wants the "truth" to be IST.
 */

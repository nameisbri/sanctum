const MONTH_ABBREVS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Parse an ISO date string (YYYY-MM-DD) into a local Date.
 * Splits on '-' to avoid timezone offset issues that occur with new Date(isoString).
 */
function parseLocalDate(isoDate: string): Date {
  const [y, m, d] = isoDate.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isYesterday(date: Date, now: Date): boolean {
  const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  return isSameDay(date, yesterday);
}

function formatMonthDay(date: Date, now: Date): string {
  const month = MONTH_ABBREVS[date.getMonth()];
  const day = date.getDate();

  if (date.getFullYear() !== now.getFullYear()) {
    return `${month} ${day}, ${date.getFullYear()}`;
  }

  return `${month} ${day}`;
}

/**
 * Returns a human-friendly relative date string.
 * - "Today" if the date matches the current day
 * - "Yesterday" if the date is the day before
 * - "Feb 6" for other same-year dates
 * - "Dec 25, 2024" for dates in a different year
 */
export function formatRelativeDate(isoDate: string, now: Date = new Date()): string {
  const date = parseLocalDate(isoDate);

  if (isSameDay(date, now)) {
    return 'Today';
  }

  if (isYesterday(date, now)) {
    return 'Yesterday';
  }

  return formatMonthDay(date, now);
}

/**
 * Returns a short date string without relative labels.
 * - "Feb 6" for same-year dates
 * - "Dec 25, 2024" for dates in a different year
 */
export function formatShortDate(isoDate: string, now: Date = new Date()): string {
  const date = parseLocalDate(isoDate);
  return formatMonthDay(date, now);
}

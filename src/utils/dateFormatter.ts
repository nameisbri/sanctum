export const MONTH_ABBREVS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Parse an ISO date string (YYYY-MM-DD) into a local Date.
 * Splits on '-' to avoid timezone offset issues that occur with new Date(isoString).
 */
export function parseLocalDate(isoDate: string): Date {
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

/** Returns the Monday (start of ISO week) for the given date. */
export function getMonday(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const day = d.getDay();
  // Sunday = 0 → offset 6; Monday = 1 → offset 0; etc.
  const diff = day === 0 ? 6 : day - 1;
  d.setDate(d.getDate() - diff);
  return d;
}

/** Returns a new Date that is `n` days after the given date. */
export function addDays(date: Date, n: number): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  d.setDate(d.getDate() + n);
  return d;
}

/** Converts a Date to an ISO date string (YYYY-MM-DD). */
export function toISODateString(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/** Formats a week range from a Monday ISO string → "Feb 3 – 9" or "Dec 29 – Jan 4". */
export function formatWeekRange(mondayISO: string): string {
  const monday = parseLocalDate(mondayISO);
  const sunday = addDays(monday, 6);

  const mMonth = MONTH_ABBREVS[monday.getMonth()];
  const mDay = monday.getDate();
  const sDay = sunday.getDate();

  if (monday.getMonth() === sunday.getMonth()) {
    return `${mMonth} ${mDay} – ${sDay}`;
  }
  const sMonth = MONTH_ABBREVS[sunday.getMonth()];
  return `${mMonth} ${mDay} – ${sMonth} ${sDay}`;
}

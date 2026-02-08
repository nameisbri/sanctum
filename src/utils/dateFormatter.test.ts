import { describe, it, expect } from 'vitest';
import { formatRelativeDate, formatShortDate } from './dateFormatter';

// Fixed reference point: Feb 8, 2026
const now = new Date(2026, 1, 8);

describe('formatRelativeDate', () => {
  it('returns "Today" for same day', () => {
    expect(formatRelativeDate('2026-02-08', now)).toBe('Today');
  });

  it('returns "Yesterday" for the day before', () => {
    expect(formatRelativeDate('2026-02-07', now)).toBe('Yesterday');
  });

  it('returns month and day for earlier same-year date', () => {
    expect(formatRelativeDate('2026-02-06', now)).toBe('Feb 6');
  });

  it('returns month, day, and year for a different year', () => {
    expect(formatRelativeDate('2024-12-25', now)).toBe('Dec 25, 2024');
  });

  it('handles Jan 1 edge case where yesterday is Dec 31 of previous year', () => {
    const jan1 = new Date(2026, 0, 1);
    expect(formatRelativeDate('2025-12-31', jan1)).toBe('Yesterday');
  });
});

describe('formatShortDate', () => {
  it('returns month and day even for today (never "Today")', () => {
    expect(formatShortDate('2026-02-08', now)).toBe('Feb 8');
  });

  it('returns month, day, and year for a different year', () => {
    expect(formatShortDate('2024-12-25', now)).toBe('Dec 25, 2024');
  });

  it('returns month and day for same-year date', () => {
    expect(formatShortDate('2026-02-06', now)).toBe('Feb 6');
  });
});

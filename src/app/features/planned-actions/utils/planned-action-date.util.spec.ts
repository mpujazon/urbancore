import { toIsoDate } from './planned-action-date.util';

describe('planned-action-date.util', () => {
  it('formats date to YYYY-MM-DD', () => {
    expect(toIsoDate(new Date(2026, 0, 5))).toBe('2026-01-05');
    expect(toIsoDate(new Date(2026, 11, 31))).toBe('2026-12-31');
    expect(toIsoDate(new Date(2026, 9, 1))).toBe('2026-10-01');
  });

  it('zero-pads single-digit months and days', () => {
    expect(toIsoDate(new Date(2026, 0, 7))).toBe('2026-01-07');
    expect(toIsoDate(new Date(2026, 8, 3))).toBe('2026-09-03');
  });
});

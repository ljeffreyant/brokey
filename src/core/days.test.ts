import { describe, expect, it } from 'vitest';
import { dayTs, daysAgoOf } from './week';

const noon = new Date(2026, 9, 20, 12, 30).getTime();

describe('day helpers', () => {
  it('goes back whole calendar days at the same time of day', () => {
    const y = new Date(dayTs(1, noon));
    expect([y.getFullYear(), y.getMonth(), y.getDate(), y.getHours(), y.getMinutes()]).toEqual([2026, 9, 19, 12, 30]);
    const m = new Date(dayTs(30, noon));
    expect([m.getMonth(), m.getDate()]).toEqual([8, 20]);
  });

  it('crosses a month boundary', () => {
    const d = new Date(dayTs(20, noon));
    expect([d.getMonth(), d.getDate()]).toEqual([8, 30]);
  });

  it('counts days ago, ignoring the time of day', () => {
    expect(daysAgoOf(noon, noon)).toBe(0);
    expect(daysAgoOf(new Date(2026, 9, 20, 0, 1).getTime(), noon)).toBe(0);
    expect(daysAgoOf(new Date(2026, 9, 19, 23, 59).getTime(), noon)).toBe(1);
    expect(daysAgoOf(dayTs(7, noon), noon)).toBe(7);
  });

  it('never goes negative for a time in the future', () => {
    expect(daysAgoOf(noon + 3 * 86400000, noon)).toBe(0);
  });

  it('round-trips', () => {
    for (let n = 0; n <= 45; n++) expect(daysAgoOf(dayTs(n, noon), noon)).toBe(n);
  });
});

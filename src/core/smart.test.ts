import { describe, expect, it } from 'vitest';
import { forecastRunOut } from './forecast';
import { detectRecurring } from './recurring';
import type { Purchase } from './types';

const DAY = 86400000;
const monday = new Date(2026, 9, 12).getTime(); // 12 Oct 2026, a Monday

describe('forecastRunOut', () => {
  const week = { weekStart: monday, weekEnd: monday + 7 * DAY, budgetCents: 14000 };

  it('stays quiet on day one, before there is anything to go on', () => {
    expect(forecastRunOut({ ...week, spentWeekCents: 9000 }, monday + 6 * 3600000)).toBeNull();
  });
  it('says when the money runs out at the current pace', () => {
    // 2 days in, spent 8000 => 4000/day, 6000 left => 1.5 days => runs out early Thursday
    const f = forecastRunOut({ ...week, spentWeekCents: 8000 }, monday + 2 * DAY);
    expect(f).not.toBeNull();
    expect(f!.inDays).toBe(1);
    expect(new Date(f!.runOutTs).getDay()).toBe(4);
  });
  it('is quiet when the money lasts the week, or is already gone', () => {
    expect(forecastRunOut({ ...week, spentWeekCents: 1000 }, monday + 3 * DAY)).toBeNull();
    expect(forecastRunOut({ ...week, spentWeekCents: 14000 }, monday + 3 * DAY)).toBeNull();
    expect(forecastRunOut({ ...week, spentWeekCents: 0 }, monday + 3 * DAY)).toBeNull();
    expect(forecastRunOut({ ...week, budgetCents: 0, spentWeekCents: 500 }, monday + 3 * DAY)).toBeNull();
  });
  it('can say today', () => {
    const f = forecastRunOut({ ...week, spentWeekCents: 13000 }, monday + 3 * DAY);
    expect(f?.inDays).toBe(0);
  });
});

const buy = (merchant: string, daysAgo: number, amountCents: number, category = 'subscription', now = monday + 60 * DAY): Purchase => ({
  id: `${merchant}${daysAgo}`,
  walletId: 'main',
  ts: now - daysAgo * DAY,
  amountCents,
  category,
  merchant,
  method: 'card',
  roast: '',
  source: 'manual',
});

describe('detectRecurring', () => {
  const now = monday + 60 * DAY;
  it('finds a monthly subscription from two charges', () => {
    const r = detectRecurring([buy('Streamflix', 31, 1699), buy('Streamflix', 1, 1699)], now);
    expect(r).toHaveLength(1);
    expect(r[0].everyDays).toBe(30);
    expect(r[0].monthlyCents).toBeGreaterThan(1600);
    expect(r[0].nextTs).toBeGreaterThan(now);
  });
  it('needs three charges for non-subscription categories', () => {
    const two = [buy('Gym Co', 30, 5000, 'health'), buy('Gym Co', 0, 5000, 'health')];
    expect(detectRecurring(two, now)).toHaveLength(0);
    expect(detectRecurring([...two, buy('Gym Co', 60, 5000, 'health')], now)).toHaveLength(1);
  });
  it('finds weekly habits', () => {
    const l = [0, 7, 14, 21].map((d) => buy('Sunday Bakery', d, 650, 'coffee'));
    const r = detectRecurring(l, now);
    expect(r[0]?.everyDays).toBe(7);
  });
  it('ignores changing amounts, messy gaps and lapsed ones', () => {
    expect(detectRecurring([buy('Cafe X', 30, 500, 'coffee'), buy('Cafe X', 15, 900, 'coffee'), buy('Cafe X', 0, 450, 'coffee')], now)).toHaveLength(0);
    expect(detectRecurring([buy('Cafe Y', 40, 500, 'coffee'), buy('Cafe Y', 11, 500, 'coffee'), buy('Cafe Y', 9, 500, 'coffee')], now)).toHaveLength(0);
    expect(detectRecurring([buy('Old Sub', 150, 1000), buy('Old Sub', 120, 1000), buy('Old Sub', 90, 1000)], now)).toHaveLength(0);
  });
  it('ignores purchases with no shop name', () => {
    expect(detectRecurring([buy('', 30, 1000), buy('', 0, 1000)], now)).toHaveLength(0);
  });
  it('sorts the costliest first', () => {
    const r = detectRecurring([buy('Small', 31, 500), buy('Small', 1, 500), buy('Big', 31, 5000), buy('Big', 1, 5000)], now);
    expect(r.map((x) => x.label)).toEqual(['Big', 'Small']);
  });
});

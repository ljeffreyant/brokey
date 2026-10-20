import { describe, expect, it } from 'vitest';
import { forecastRunOut } from './forecast';
import { campaignToken, goTarget } from './golink';
import { bleedTotals, ladderState } from './ladder';
import { eveningSlots } from './nudge';
import { noSpendDays } from './recap';
import { detectRecurring, dueRecurring } from './recurring';
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

import { DEFAULT_UNIT, cleanShiftHours, displayUnit, formatUnits, isTimeUnit, nextUnitMode, shiftUnit, unitsNumber, unitLabel, workUnit } from './money';
import { roastFor } from './roasts';
import { SFX_NAMES, afterBuyCue, regretCue } from './cues';
import { REVIEW_GAP_DAYS, REVIEW_MAX_ASKS, shouldAskForReview } from './review';

describe('work mode', () => {
  const unit = workUnit(2800); // $28 an hour
  it('only switches on with an hourly rate', () => {
    expect(displayUnit(DEFAULT_UNIT, 2800, 'work').id).toBe('work');
    expect(displayUnit(DEFAULT_UNIT, null, 'work')).toBe(DEFAULT_UNIT);
    expect(displayUnit(DEFAULT_UNIT, 2800, 'hsp')).toBe(DEFAULT_UNIT);
    expect(displayUnit(DEFAULT_UNIT, 2800, undefined)).toBe(DEFAULT_UNIT);
  });
  it('shows minutes under an hour and hours above, with the unit inside the text', () => {
    expect(formatUnits(650, unit)).toBe('14m');
    expect(formatUnits(1400, unit)).toBe('30m');
    expect(formatUnits(2800, unit)).toBe('1h');
    expect(formatUnits(5880, unit)).toBe('2.1h');
    expect(formatUnits(28000, unit)).toBe('10h');
    expect(formatUnits(0, unit)).toBe('0m');
    expect(formatUnits(1, unit)).toBe('1m');
    expect(formatUnits(-1400, unit)).toBe('-30m');
    expect(unitsNumber(650, unit)).toBe('14m');
    expect(unitLabel(650, unit)).toBe('');
  });
  it('rounds 59.6 minutes up to an hour instead of saying 60m', () => {
    expect(formatUnits(2780, unit)).toBe('1h');
  });
  it('speaks the language', () => {
    expect(formatUnits(650, unit, 'zh')).toBe('14分钟');
    expect(formatUnits(5880, unit, 'id')).toBe('2,1 jam');
    expect(formatUnits(650, unit, 'es')).toBe('14 min');
  });
  it('leaves HSP formatting alone', () => {
    expect(formatUnits(5400, DEFAULT_UNIT)).toBe('3 HSPs');
  });
  it('never uses the snack pack lines when prices are in time', () => {
    for (let seed = 0; seed < 30; seed++) {
      const line = roastFor({
        category: 'coffee', amountCents: 9000, level: 'unhinged', bodyRoasts: false, unit, bigAtCents: 3600, hourlyCents: 2800,
        countThisWeek: 1, overBudget: false, weeklyBudgetCents: 14000, method: 'tap', hour: 14, seed, lang: 'en',
      });
      expect(line).not.toMatch(/snack pack/i);
      expect(line).not.toMatch(/\{[a-z]+\}/);
    }
  });
});

describe('shifts', () => {
  const unit = shiftUnit(2800, 6); // $28 an hour, 6 hour shift = $168 a shift
  it('only switches on with an hourly rate', () => {
    expect(displayUnit(DEFAULT_UNIT, 2800, 'shift', 6).id).toBe('shift');
    expect(displayUnit(DEFAULT_UNIT, 2800, 'shift', 6).priceCents).toBe(16800);
    expect(displayUnit(DEFAULT_UNIT, null, 'shift', 6)).toBe(DEFAULT_UNIT);
    expect(isTimeUnit(unit)).toBe(true);
    expect(isTimeUnit(workUnit(2800))).toBe(true);
    expect(isTimeUnit(DEFAULT_UNIT)).toBe(false);
  });
  it('shows a share of a shift with its name inside the text', () => {
    expect(formatUnits(6720, unit)).toBe('0.4 shifts');
    expect(formatUnits(16800, unit)).toBe('1 shift');
    expect(formatUnits(33600, unit)).toBe('2 shifts');
    expect(formatUnits(0, unit)).toBe('0 shifts');
    expect(unitsNumber(6720, unit)).toBe('0.4 shifts');
    expect(unitLabel(6720, unit)).toBe('');
  });
  it('shows a sliver of a shift as minutes instead of 0 shifts', () => {
    expect(formatUnits(1400, unit)).toBe('30m'); // 0.083 of a shift
    expect(formatUnits(650, unit)).toBe('14m');
  });
  it('speaks the language', () => {
    expect(formatUnits(6720, unit, 'zh')).toBe('0.4个班');
    expect(formatUnits(6720, unit, 'id')).toBe('0,4 shift');
    expect(formatUnits(33600, unit, 'es')).toBe('2 turnos');
    expect(formatUnits(16800, unit, 'es')).toBe('1 turno');
  });
  it('keeps the shift length sensible', () => {
    expect(cleanShiftHours(6)).toBe(6);
    expect(cleanShiftHours(7.3)).toBe(7.5);
    expect(cleanShiftHours(0)).toBe(1);
    expect(cleanShiftHours(99)).toBe(14);
    expect(cleanShiftHours('x')).toBe(6);
    expect(cleanShiftHours(NaN)).toBe(6);
  });
  it('never uses the snack pack lines when prices are in shifts', () => {
    for (let seed = 0; seed < 30; seed++) {
      const line = roastFor({
        category: 'coffee', amountCents: 9000, level: 'unhinged', bodyRoasts: false, unit, bigAtCents: 3600, hourlyCents: 2800,
        countThisWeek: 1, overBudget: false, weeklyBudgetCents: 14000, method: 'tap', hour: 14, seed, lang: 'en',
      });
      expect(line).not.toMatch(/snack pack/i);
      expect(line).not.toMatch(/\{[a-z]+\}/);
    }
  });
});

describe('tap to switch units', () => {
  it('goes HSPs, hours, then back while shifts are shelved', () => {
    expect(nextUnitMode('hsp', true)).toBe('work');
    expect(nextUnitMode('work', true)).toBe('hsp');
    expect(nextUnitMode(undefined, true)).toBe('work');
    expect(nextUnitMode('shift', true)).toBe('hsp');
  });
  it('includes shifts when they are switched on', () => {
    expect(nextUnitMode('hsp', true, true)).toBe('work');
    expect(nextUnitMode('work', true, true)).toBe('shift');
    expect(nextUnitMode('shift', true, true)).toBe('hsp');
  });
  it('stays on HSPs without an hourly rate', () => {
    expect(nextUnitMode('hsp', false)).toBe('hsp');
    expect(nextUnitMode('work', false)).toBe('hsp');
  });
});

describe('sound cues', () => {
  it('rewards a good call and groans at a bad one', () => {
    expect(regretCue('worth')).toBe('coin');
    expect(regretCue('nah')).toBe('nope');
    expect(regretCue('meh')).toBeNull();
  });
  it('only adds a sound after the bite when it lands badly', () => {
    expect(afterBuyCue('broke')).toBe('nope');
    expect(afterBuyCue('sad')).toBe('nope');
    expect(afterBuyCue('happy')).toBeNull();
    expect(afterBuyCue('shock')).toBeNull();
  });
  it('has a file for every cue', () => {
    expect(new Set(SFX_NAMES).size).toBe(SFX_NAMES.length);
    for (const n of SFX_NAMES) expect(require('node:fs').existsSync(`assets/sfx/${n}.wav`), n).toBe(true);
  });
});

describe('rating prompt', () => {
  const day = 86_400_000;
  const base = { now: 100 * day, startedTs: 80 * day, purchaseCount: 12, asks: 0, lastAskTs: null as number | null };
  it('asks someone who has really used the app', () => {
    expect(shouldAskForReview(base)).toBe(true);
  });
  it('waits for a few days and a few buys', () => {
    expect(shouldAskForReview({ ...base, startedTs: 98 * day })).toBe(false);
    expect(shouldAskForReview({ ...base, purchaseCount: 3 })).toBe(false);
  });
  it('never nags: spaced out and capped', () => {
    expect(shouldAskForReview({ ...base, asks: 1, lastAskTs: base.now - 10 * day })).toBe(false);
    expect(shouldAskForReview({ ...base, asks: 1, lastAskTs: base.now - (REVIEW_GAP_DAYS + 1) * day })).toBe(true);
    expect(shouldAskForReview({ ...base, asks: REVIEW_MAX_ASKS, lastAskTs: base.now - 400 * day })).toBe(false);
  });
});

describe('dueRecurring', () => {
  const base = monday + 60 * DAY;
  const items = (daysSinceLast: number) => detectRecurring([buy('Streamflix', daysSinceLast + 30, 1699, 'subscription', base), buy('Streamflix', daysSinceLast, 1699, 'subscription', base)], base);

  it('stays quiet until the charge is about due', () => {
    expect(dueRecurring(items(20), {}, base)).toHaveLength(0);
  });
  it('offers a charge that is due today, or a little overdue', () => {
    expect(dueRecurring(items(30), {}, base)).toHaveLength(1);
    expect(dueRecurring(items(29.6), {}, base)).toHaveLength(1);
    expect(dueRecurring(items(34), {}, base)).toHaveLength(1);
  });
  it('drops a charge that is long overdue, it was probably cancelled', () => {
    expect(dueRecurring(items(50), {}, base)).toHaveLength(0);
  });
  it('stays quiet for a skipped cycle, then comes back for the next one', () => {
    const due = dueRecurring(items(30), {}, base)[0];
    expect(dueRecurring(items(30), { [due.key]: due.nextTs }, base)).toHaveLength(0);
    const later = base + 30 * DAY;
    const next = detectRecurring([buy('Streamflix', 60, 1699, 'subscription', later), buy('Streamflix', 30, 1699, 'subscription', later), buy('Streamflix', 0, 1699, 'subscription', later)], later);
    expect(next).toHaveLength(1);
    expect(dueRecurring(next, { [due.key]: due.nextTs }, later + 30 * DAY - 1000)).toHaveLength(1);
  });
});

describe('eveningSlots', () => {
  // 15 Oct 2026, 3pm local
  const at = (d: number, h: number) => new Date(2026, 9, d, h, 0, 0, 0).getTime();
  const logAt = (ts: number) => ({ ts });

  it('picks the next three evenings at 8pm', () => {
    const s = eveningSlots({ now: at(15, 15), purchases: [] });
    expect(s).toEqual([at(15, 20), at(16, 20), at(17, 20)]);
  });
  it('skips tonight once something is logged today', () => {
    const s = eveningSlots({ now: at(15, 15), purchases: [logAt(at(15, 9))] });
    expect(s).toEqual([at(16, 20), at(17, 20), at(18, 20)]);
  });
  it('starts tomorrow when tonight has already passed', () => {
    const s = eveningSlots({ now: at(15, 21), purchases: [] });
    expect(s[0]).toBe(at(16, 20));
    expect(s).toHaveLength(3);
  });
  it('only looks at today when skipping, other days are still nudged', () => {
    const s = eveningSlots({ now: at(15, 15), purchases: [logAt(at(12, 10)), logAt(at(14, 18))] });
    expect(s[0]).toBe(at(15, 20));
  });
  it('can be set to another hour', () => {
    expect(eveningSlots({ now: at(15, 15), purchases: [], hour: 21 })[0]).toBe(at(15, 21));
  });
});

describe('noSpendDays', () => {
  it('counts empty days up to today and ignores the future', () => {
    // Monday week, now is Wednesday afternoon: Mon spent, Tue empty, Wed (today) empty so far, Thu to Sun are future
    const daily = [500, 0, 0, 0, 0, 0, 0];
    expect(noSpendDays(daily, monday, monday + 2 * DAY + 15 * 3600000)).toBe(2);
  });
  it('counts the whole week once it is over', () => {
    expect(noSpendDays([0, 300, 0, 0, 0, 900, 0], monday, monday + 8 * DAY)).toBe(5);
  });
});

describe('ladderState', () => {
  const price = 1800;
  it('starts at the bottom', () => {
    const s = ladderState(0, price);
    expect(s.rungs.every((r) => !r.reached)).toBe(true);
    expect(s.next?.id).toBe('side');
    expect(s.progress).toBe(0);
    expect(s.toGoCents).toBe(10 * price);
  });
  it('measures progress between the last rung and the next', () => {
    // 30 HSPs: past the side (10), halfway-ish to mini (50): (30 - 10) / (50 - 10) = 0.5
    const s = ladderState(30 * price, price);
    expect(s.rungs.filter((r) => r.reached).map((r) => r.id)).toEqual(['side']);
    expect(s.next?.id).toBe('mini');
    expect(s.progress).toBeCloseTo(0.5);
    expect(s.toGoCents).toBe(20 * price);
  });
  it('counts a rung the moment the money gets there', () => {
    expect(ladderState(50 * price, price).rungs.find((r) => r.id === 'mini')?.reached).toBe(true);
    expect(ladderState(50 * price - 1, price).rungs.find((r) => r.id === 'mini')?.reached).toBe(false);
  });
  it('tops out', () => {
    const s = ladderState(900 * price, price);
    expect(s.next).toBeNull();
    expect(s.progress).toBe(1);
  });
  it('follows the unit price', () => {
    expect(ladderState(10 * 1500, 1500).rungs[0].reached).toBe(true);
    expect(ladderState(10 * 1500, 1800).rungs[0].reached).toBe(false);
  });
  it('survives a zero price and negative money', () => {
    expect(() => ladderState(-5, 0)).not.toThrow();
  });
});

describe('bleedTotals', () => {
  it('adds up every repeating charge', () => {
    expect(bleedTotals([{ monthlyCents: 1699, yearlyCents: 20388 }, { monthlyCents: 5500, yearlyCents: 66000 }])).toEqual({ monthlyCents: 7199, yearlyCents: 86388 });
    expect(bleedTotals([])).toEqual({ monthlyCents: 0, yearlyCents: 0 });
  });
});

describe('goTarget', () => {
  const base = { appStoreId: '', providerToken: '', testflightUrl: '', fallback: '../../index.html' };
  it('lands on the site until something is set up', () => {
    expect(goTarget('tiktok', base)).toBe('../../index.html');
  });
  it('uses a real TestFlight link and ignores anything else', () => {
    expect(goTarget('tiktok', { ...base, testflightUrl: 'https://testflight.apple.com/join/AbC123' })).toBe('https://testflight.apple.com/join/AbC123');
    expect(goTarget('tiktok', { ...base, testflightUrl: 'https://evil.example/join/AbC123' })).toBe('../../index.html');
    expect(goTarget('tiktok', { ...base, testflightUrl: 'javascript:alert(1)' })).toBe('../../index.html');
  });
  it('tags the App Store link with the channel, and wins over TestFlight', () => {
    const cfg = { ...base, appStoreId: '6741234567', providerToken: '123456', testflightUrl: 'https://testflight.apple.com/join/AbC123' };
    expect(goTarget('poster', cfg)).toBe('https://apps.apple.com/app/id6741234567?pt=123456&ct=poster&mt=8');
  });
  it('works without a provider token yet', () => {
    expect(goTarget('crew-1', { ...base, appStoreId: 'id6741234567' })).toBe('https://apps.apple.com/app/id6741234567?ct=crew-1&mt=8');
  });
  it('cleans the campaign token', () => {
    expect(campaignToken('  Uni Melb / Club!! ')).toBe('uni-melb-club');
    expect(campaignToken('x'.repeat(50))).toHaveLength(30);
  });
});

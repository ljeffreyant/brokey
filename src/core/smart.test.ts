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

import { DEFAULT_UNIT, cleanShiftHours, displayUnit, formatUnits, isTimeUnit, nextUnitMode, shiftUnit, unitsNumber, unitLabel, workUnit } from './money';
import { roastFor } from './roasts';
import { SFX_NAMES, afterBuyCue, regretCue } from './cues';

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

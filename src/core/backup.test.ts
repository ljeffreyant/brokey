import { describe, expect, it } from 'vitest';
import { BACKUP_FORMAT, BackupData, BackupError, backupFileName, buildBackup, parseBackup } from './backup';
import { DEFAULT_UNIT } from './money';
import type { Purchase, Settings, Wallet } from './types';

const base: Settings = {
  onboarded: true, startedTs: 1, unit: DEFAULT_UNIT, hourlyCents: null, unitMode: 'hsp', shiftHours: 6, roastLevel: 'medium', bodyRoasts: false, weekStartsOn: 1, goalName: '',
  language: 'en', currency: 'AUD', showCents: false, roundSummaries: false, theme: 'system', activeWalletId: 'main', notifyWish: true, notifyWeekly: false,
  notifyPace: true, notifyRecurring: true, notifyEvening: false, lockApp: false, lastBackupTs: null, adultConfirmed: false, reviewAsks: 0, lastReviewAskTs: null, sounds: true, haptics: true,
};
const wallet: Wallet = { id: 'main', name: 'Main', icon: 'hsp', color: '#FFD23F', income: [], recurring: [], savingsWeeklyCents: 0, budgetMode: 'manual', manualWeeklyCents: 15000, createdTs: 1 };
const buy = (id: string, over: Partial<Purchase> = {}): Purchase => ({ id, walletId: 'main', ts: 1_000 + Number(id.replace(/\D/g, '')), amountCents: 650, category: 'coffee', method: 'tap', roast: 'Coffee again.', source: 'manual', ...over });
const data = (over: Partial<BackupData> = {}): BackupData => ({
  settings: { ...base, lockApp: true, hourlyCents: 2800, unitMode: 'work' },
  wallets: [wallet], purchases: [buy('p1'), buy('p2'), buy('p3')], wishes: [], shame: [], customCats: [], hiddenCats: ['x'], recentRoasts: ['a'], seenStickers: ['first'],
  ...over,
});
const text = (d: BackupData, extra: Record<string, unknown> = {}) => JSON.stringify({ format: BACKUP_FORMAT, version: 1, exportedAt: 5000, data: d, ...extra });
const code = (fn: () => unknown) => {
  try {
    fn();
  } catch (e) {
    return e instanceof BackupError ? e.code : 'other';
  }
  return 'none';
};

describe('backup', () => {
  it('round trips everything', () => {
    const d = data();
    const { data: back, summary } = parseBackup(buildBackup(d, 5000), base);
    expect(back.purchases).toEqual(d.purchases);
    expect(back.wallets).toEqual(d.wallets);
    expect(back.hiddenCats).toEqual(['x']);
    expect(back.seenStickers).toEqual(['first']);
    expect(summary).toMatchObject({ purchases: 3, wallets: 1, dropped: 0, exportedAt: 5000, firstTs: 1001, lastTs: 1003 });
  });

  it('keeps settings but never restores the app lock, and keeps work mode only with a rate', () => {
    const { data: back } = parseBackup(text(data()), base);
    expect(back.settings.lockApp).toBe(false);
    expect(back.settings.unitMode).toBe('work');
    expect(back.settings.hourlyCents).toBe(2800);
    const noRate = parseBackup(text(data({ settings: { ...base, unitMode: 'work', hourlyCents: null } })), base).data.settings;
    expect(noRate.unitMode).toBe('hsp');
    const shifts = parseBackup(text(data({ settings: { ...base, unitMode: 'shift', hourlyCents: 2800, shiftHours: 7.3 } })), base).data.settings;
    expect(shifts.unitMode).toBe('shift');
    expect(shifts.shiftHours).toBe(7.5);
    const noRateShift = parseBackup(text(data({ settings: { ...base, unitMode: 'shift', hourlyCents: null } })), base).data.settings;
    expect(noRateShift.unitMode).toBe('hsp');
  });

  it('fills settings keys an older file does not have', () => {
    const old = JSON.parse(text(data()));
    delete old.data.settings.notifyPace;
    delete old.data.settings.lastBackupTs;
    const s = parseBackup(JSON.stringify(old), base).data.settings;
    expect(s.notifyPace).toBe(true);
    expect(s.lastBackupTs).toBeNull();
  });

  it('rejects things that are not a backup, with a code the UI can explain', () => {
    expect(code(() => parseBackup('', base))).toBe('empty');
    expect(code(() => parseBackup('hello', base))).toBe('notJson');
    expect(code(() => parseBackup('[1,2]', base))).toBe('notBackup');
    expect(code(() => parseBackup(JSON.stringify({ format: 'other', version: 1, data: {} }), base))).toBe('notBackup');
    expect(code(() => parseBackup(text(data(), { version: 99 }), base))).toBe('tooNew');
    expect(code(() => parseBackup(text(data(), { version: 0 }), base))).toBe('invalid');
    expect(code(() => parseBackup(text(data({ wallets: [] })), base))).toBe('invalid');
  });

  it('drops unreadable rows and counts them', () => {
    const d = data();
    const raw = JSON.parse(text(d));
    raw.data.purchases.push({ id: 'bad' }, 'junk', buy('p9', { walletId: 'ghost' }));
    raw.data.wishes = [{ id: 'w1', label: 'x', amountCents: 5, category: 'tech', createdTs: 1, unlockTs: 2, status: 'cooling' }, { id: 'w2', status: 'nope' }];
    const { data: back, summary } = parseBackup(JSON.stringify(raw), base);
    expect(back.purchases).toHaveLength(3);
    expect(back.wishes).toHaveLength(1);
    expect(summary.dropped).toBe(4);
  });

  it('points a missing active wallet at the first one and keeps the overview', () => {
    expect(parseBackup(text(data({ settings: { ...base, activeWalletId: 'gone' } })), base).data.settings.activeWalletId).toBe('main');
    expect(parseBackup(text(data({ settings: { ...base, activeWalletId: 'all' } })), base).data.settings.activeWalletId).toBe('all');
  });

  it('ignores junk setting values instead of trusting them', () => {
    const raw = JSON.parse(text(data()));
    Object.assign(raw.data.settings, { language: 'xx', theme: 'neon', currency: 'ZZZ', roastLevel: 'savage', weekStartsOn: 9, unit: { id: 1 } });
    const s = parseBackup(JSON.stringify(raw), base).data.settings;
    expect(s).toMatchObject({ language: 'en', theme: 'system', currency: 'AUD', roastLevel: 'medium', weekStartsOn: 1, unit: DEFAULT_UNIT });
  });

  it('survives a byte order mark and names the file by date', () => {
    expect(parseBackup('﻿' + text(data()), base).data.purchases).toHaveLength(3);
    expect(backupFileName(new Date(2026, 9, 5, 12).getTime())).toBe('Brokey-backup-2026-10-05.json');
  });
});

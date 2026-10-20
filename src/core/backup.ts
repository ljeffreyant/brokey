import { cleanShiftHours, currencyDef } from './money';
import type { CategoryMeta, Purchase, Settings, ShameItem, UnitDef, Wallet, WishItem } from './types';

/**
 * A backup is one JSON file holding everything the app stores. It is the only way to move to a new phone,
 * because nothing leaves the device. Restoring is strict about shape and forgiving about gaps: rows that
 * cannot be read are dropped and counted, new settings keys fall back to their defaults.
 */
export const BACKUP_FORMAT = 'brokey-backup';
export const BACKUP_VERSION = 1;
const MAX_BYTES = 25 * 1024 * 1024;

export interface BackupData {
  settings: Settings;
  wallets: Wallet[];
  purchases: Purchase[];
  wishes: WishItem[];
  shame: ShameItem[];
  customCats: CategoryMeta[];
  hiddenCats: string[];
  recentRoasts: string[];
  seenStickers: string[];
}

export interface BackupFile {
  format: typeof BACKUP_FORMAT;
  version: number;
  exportedAt: number;
  data: BackupData;
}

export interface BackupSummary {
  exportedAt: number;
  purchases: number;
  wallets: number;
  wishes: number;
  shame: number;
  /** rows that were unreadable and left out */
  dropped: number;
  firstTs: number | null;
  lastTs: number | null;
}

export type BackupErrorCode = 'empty' | 'tooBig' | 'notJson' | 'notBackup' | 'tooNew' | 'invalid';

export class BackupError extends Error {
  code: BackupErrorCode;
  constructor(code: BackupErrorCode) {
    super(`backup: ${code}`);
    this.code = code;
  }
}

export function buildBackup(data: BackupData, now = Date.now()): string {
  const file: BackupFile = { format: BACKUP_FORMAT, version: BACKUP_VERSION, exportedAt: now, data };
  return JSON.stringify(file);
}

export function backupFileName(now = Date.now()): string {
  const d = new Date(now);
  const p = (n: number) => String(n).padStart(2, '0');
  return `Brokey-backup-${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}.json`;
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null && !Array.isArray(v);
const isStr = (v: unknown): v is string => typeof v === 'string';
const isNum = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v);
const strs = (v: unknown): string[] => (Array.isArray(v) ? v.filter(isStr) : []);

const LEVELS = ['mild', 'medium', 'unhinged'];
const LANGS = ['en', 'zh', 'id', 'es'];
const THEMES = ['system', 'garlic', 'bbq', 'kebab', 'chilli', 'mint'];

function cleanUnit(v: unknown, fallback: UnitDef): UnitDef {
  if (isObj(v) && isStr(v.id) && isStr(v.singular) && isStr(v.plural) && isNum(v.priceCents) && v.priceCents > 0) {
    return { id: v.id, singular: v.singular, plural: v.plural, priceCents: Math.round(v.priceCents) };
  }
  return fallback;
}

function cleanSettings(raw: unknown, base: Settings, walletIds: string[]): Settings {
  const r = isObj(raw) ? raw : {};
  const s: Settings = { ...base };
  const bool = <K extends keyof Settings>(k: K) => {
    if (typeof r[k] === 'boolean') (s as unknown as Record<string, unknown>)[k] = r[k];
  };
  (['onboarded', 'bodyRoasts', 'showCents', 'roundSummaries', 'notifyWish', 'notifyWeekly', 'notifyPace', 'notifyRecurring', 'notifyEvening', 'adultConfirmed', 'sounds', 'haptics'] as const).forEach(bool);
  if (isNum(r.startedTs)) s.startedTs = r.startedTs;
  s.unit = cleanUnit(r.unit, base.unit);
  s.hourlyCents = isNum(r.hourlyCents) && r.hourlyCents > 0 ? Math.round(r.hourlyCents) : null;
  s.unitMode = s.hourlyCents && (r.unitMode === 'work' || r.unitMode === 'shift') ? r.unitMode : 'hsp';
  s.shiftHours = cleanShiftHours(r.shiftHours);
  s.reviewAsks = isNum(r.reviewAsks) && r.reviewAsks >= 0 ? Math.min(99, Math.round(r.reviewAsks)) : 0;
  s.lastReviewAskTs = isNum(r.lastReviewAskTs) ? r.lastReviewAskTs : null;
  if (isStr(r.roastLevel) && LEVELS.includes(r.roastLevel)) s.roastLevel = r.roastLevel as Settings['roastLevel'];
  if (isNum(r.weekStartsOn) && r.weekStartsOn >= 0 && r.weekStartsOn <= 6) s.weekStartsOn = Math.round(r.weekStartsOn);
  if (isStr(r.goalName)) s.goalName = r.goalName.slice(0, 80);
  if (isStr(r.language) && LANGS.includes(r.language)) s.language = r.language as Settings['language'];
  if (isStr(r.currency) && currencyDef(r.currency as never).code === r.currency) s.currency = r.currency as Settings['currency'];
  if (isStr(r.theme) && THEMES.includes(r.theme)) s.theme = r.theme as Settings['theme'];
  s.activeWalletId = isStr(r.activeWalletId) && (r.activeWalletId === 'all' || walletIds.includes(r.activeWalletId)) ? r.activeWalletId : walletIds[0];
  // never restore a lock onto a phone that may not have one set up: it could lock the owner out
  s.lockApp = false;
  s.lastBackupTs = isNum(r.lastBackupTs) ? r.lastBackupTs : null;
  return s;
}

const okWallet = (w: unknown): w is Wallet =>
  isObj(w) && isStr(w.id) && isStr(w.name) && isNum(w.manualWeeklyCents) && isNum(w.createdTs) && Array.isArray(w.income) && Array.isArray(w.recurring);
const okPurchase = (x: unknown): x is Purchase =>
  isObj(x) && isStr(x.id) && isStr(x.walletId) && isNum(x.ts) && isNum(x.amountCents) && isStr(x.category) && isStr(x.method) && isStr(x.roast);
const okWish = (x: unknown): x is WishItem =>
  isObj(x) && isStr(x.id) && isStr(x.label) && isNum(x.amountCents) && isStr(x.category) && isNum(x.createdTs) && isNum(x.unlockTs) && ['cooling', 'bought', 'ditched'].includes(x.status as string);
const okShame = (x: unknown): x is ShameItem => isObj(x) && isStr(x.id) && isNum(x.ts) && isStr(x.label) && isNum(x.amountCents);
const okCat = (x: unknown): x is CategoryMeta => isObj(x) && isStr(x.id) && isStr(x.label) && isStr(x.group) && isStr(x.icon) && isStr(x.noun) && isStr(x.headline) && isStr(x.roastAs);

/** Reads and checks a backup file's text. Throws BackupError with a code the UI can explain. */
export function parseBackup(text: string, defaults: Settings): { data: BackupData; summary: BackupSummary } {
  if (!text || !text.trim()) throw new BackupError('empty');
  if (text.length > MAX_BYTES) throw new BackupError('tooBig');
  let raw: unknown;
  try {
    raw = JSON.parse(text.replace(/^﻿/, ''));
  } catch {
    throw new BackupError('notJson');
  }
  if (!isObj(raw) || raw.format !== BACKUP_FORMAT || !isObj(raw.data)) throw new BackupError('notBackup');
  if (!isNum(raw.version) || raw.version < 1) throw new BackupError('invalid');
  if (raw.version > BACKUP_VERSION) throw new BackupError('tooNew');
  const d = raw.data;
  if (!Array.isArray(d.wallets) || !Array.isArray(d.purchases)) throw new BackupError('invalid');

  const rows = <T>(v: unknown, ok: (x: unknown) => x is T): { keep: T[]; dropped: number } => {
    const arr = Array.isArray(v) ? v : [];
    const keep = arr.filter(ok);
    return { keep, dropped: arr.length - keep.length };
  };
  const w = rows(d.wallets, okWallet);
  if (w.keep.length === 0) throw new BackupError('invalid');
  const walletIds = w.keep.map((x) => x.id);
  const pAll = rows(d.purchases, okPurchase);
  // a purchase pointing at a wallet that is not in the file could never be shown
  const purchases = pAll.keep.filter((x) => walletIds.includes(x.walletId));
  const wi = rows(d.wishes, okWish);
  const sh = rows(d.shame, okShame);
  const ca = rows(d.customCats, okCat);

  const data: BackupData = {
    settings: cleanSettings(d.settings, defaults, walletIds),
    wallets: w.keep,
    purchases,
    wishes: wi.keep,
    shame: sh.keep,
    customCats: ca.keep,
    hiddenCats: strs(d.hiddenCats),
    recentRoasts: strs(d.recentRoasts).slice(0, 40),
    seenStickers: strs(d.seenStickers),
  };
  const ts = purchases.map((x) => x.ts);
  const exportedAt = isNum(raw.exportedAt) ? raw.exportedAt : 0;
  return {
    data,
    summary: {
      exportedAt,
      purchases: purchases.length,
      wallets: w.keep.length,
      wishes: wi.keep.length,
      shame: sh.keep.length,
      dropped: w.dropped + pAll.dropped + (pAll.keep.length - purchases.length) + wi.dropped + sh.dropped + ca.dropped,
      firstTs: ts.length ? Math.min(...ts) : null,
      lastTs: ts.length ? Math.max(...ts) : null,
    },
  };
}

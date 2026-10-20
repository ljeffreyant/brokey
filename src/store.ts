import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  BackupData,
  BudgetState,
  CategoryId,
  CategoryMeta,
  CurrencyCode,
  DEFAULT_UNIT,
  GroupId,
  LangId,
  MoneyFmt,
  PayMethod,
  Purchase,
  Regret,
  Settings,
  ShameItem,
  Wallet,
  WishItem,
  computeWalletBudget,
  formatMoney,
  createWish,
  makeCustomCategory,
  registerCustomCategories,
  roastFor,
  startOfWeek,
  uid,
  unitForCurrency,
  unlockedStickerIds,
  displayUnit,
  DEFAULT_SHIFT_HOURS,
} from './core';
import { cancelNotification, scheduleWishUnlock } from './notify';

export const defaultSettings = (): Settings => ({
  onboarded: false,
  startedTs: Date.now(),
  unit: DEFAULT_UNIT,
  hourlyCents: null,
  unitMode: 'hsp',
  shiftHours: DEFAULT_SHIFT_HOURS,
  roastLevel: 'medium',
  bodyRoasts: false,
  weekStartsOn: 1,
  goalName: '',
  language: 'en',
  currency: 'AUD',
  showCents: false,
  roundSummaries: false,
  theme: 'system',
  activeWalletId: 'main',
  notifyWish: true,
  notifyWeekly: false,
  notifyPace: true,
  notifyRecurring: true,
  lockApp: false,
  lastBackupTs: null,
  adultConfirmed: false,
  sounds: true,
  haptics: true,
});

export const WALLET_COLORS = ['#FFD23F', '#EE3B2B', '#7CC8FF', '#FF9E8F', '#B56D36', '#9BE3A5', '#C9A7FF', '#FFFDF3'];

export const defaultWallet = (name = 'Main', id = 'main'): Wallet => ({
  id,
  name,
  icon: 'hsp',
  color: WALLET_COLORS[0],
  income: [],
  recurring: [],
  savingsWeeklyCents: 0,
  budgetMode: 'manual',
  manualWeeklyCents: 10000,
  createdTs: Date.now(),
});

export interface LogInput {
  amountCents: number;
  category: CategoryId;
  merchant?: string;
  method: PayMethod;
  note?: string;
  ts?: number;
  source?: Purchase['source'];
  wishId?: string;
  walletId?: string;
}

export interface LogResult {
  purchase: Purchase;
  roast: string;
  before: BudgetState;
  after: BudgetState;
  newStickers: string[];
}

/** How money should be shown right now. `summary` rounds when the user asked for rounded summaries. */
export function moneyFmt(s: Pick<Settings, 'currency' | 'language' | 'showCents' | 'roundSummaries'>, summary = false): MoneyFmt {
  return {
    currency: s.currency,
    locale: s.language,
    decimals: summary && s.roundSummaries ? 'none' : s.showCents ? 'always' : 'auto',
  };
}

interface State {
  settings: Settings;
  wallets: Wallet[];
  purchases: Purchase[];
  wishes: WishItem[];
  shame: ShameItem[];
  customCats: CategoryMeta[];
  hiddenCats: string[];
  recentRoasts: string[];
  seenStickers: string[];
  hydrated: boolean;

  completeOnboarding: (settings: Partial<Settings>, wallet: Partial<Wallet>) => void;
  updateSettings: (patch: Partial<Settings>) => void;
  setCurrency: (code: CurrencyCode) => void;
  setLanguage: (lang: LangId) => void;
  setActiveWallet: (id: string) => void;
  addWallet: (patch: Partial<Wallet>) => Wallet;
  updateWallet: (id: string, patch: Partial<Wallet>) => void;
  archiveWallet: (id: string, archived: boolean) => void;
  deleteWallet: (id: string) => void;
  addCustomCategory: (label: string, group: GroupId, icon: string) => CategoryMeta;
  removeCustomCategory: (id: string) => void;
  setCategoryHidden: (id: string, hidden: boolean) => void;
  logPurchase: (input: LogInput) => LogResult;
  removePurchase: (id: string) => void;
  updatePurchase: (id: string, patch: Partial<Pick<Purchase, 'category' | 'merchant' | 'note' | 'amountCents' | 'ts'>>) => void;
  answerRegret: (id: string, regret: Regret) => void;
  addShame: (item: Omit<ShameItem, 'id' | 'ts'> & { ts?: number }) => ShameItem;
  removeShame: (id: string) => void;
  addWish: (label: string, amountCents: number, category: CategoryId, hours: number) => WishItem;
  decideWish: (id: string, outcome: 'bought' | 'ditched') => LogResult | null;
  markStickersSeen: (ids: string[]) => void;
  resetAll: () => void;
  /** replace everything with a validated backup */
  restoreBackup: (data: BackupData) => void;
}

/** The wallet a new purchase goes to: the one on screen, or the first live one when viewing everything. */
function targetWallet(s: { settings: Settings; wallets: Wallet[] }, wanted?: string): Wallet {
  const live = s.wallets.filter((w) => !w.archived);
  return (
    live.find((w) => w.id === (wanted ?? s.settings.activeWalletId)) ??
    live[0] ??
    s.wallets[0]
  );
}

export const useStore = create<State>()(
  persist(
    (set, get) => ({
      settings: defaultSettings(),
      wallets: [defaultWallet()],
      purchases: [],
      wishes: [],
      shame: [],
      customCats: [],
      hiddenCats: [],
      recentRoasts: [],
      seenStickers: [],
      hydrated: false,

      completeOnboarding: (settingsPatch, walletPatch) =>
        set((s) => ({
          settings: { ...s.settings, ...settingsPatch, onboarded: true, startedTs: Date.now() },
          wallets: s.wallets.map((w, i) => (i === 0 ? { ...w, ...walletPatch } : w)),
        })),

      updateSettings: (patch) => set((s) => ({ settings: { ...s.settings, ...patch } })),

      setCurrency: (code) =>
        set((s) => {
          // an unedited HSP follows the currency; a hand-edited price stays put
          const wasDefault = s.settings.unit.id === 'hsp' && s.settings.unit.priceCents === unitForCurrency(DEFAULT_UNIT, s.settings.currency).priceCents;
          return {
            settings: {
              ...s.settings,
              currency: code,
              unit: wasDefault ? unitForCurrency(DEFAULT_UNIT, code) : s.settings.unit,
            },
          };
        }),

      setLanguage: (lang) => set((s) => ({ settings: { ...s.settings, language: lang } })),

      setActiveWallet: (id) => set((s) => ({ settings: { ...s.settings, activeWalletId: id } })),

      addWallet: (patch) => {
        const w: Wallet = { ...defaultWallet(patch.name ?? 'New wallet', uid()), ...patch, id: uid(), createdTs: Date.now() };
        set((s) => ({ wallets: [...s.wallets, w], settings: { ...s.settings, activeWalletId: w.id } }));
        return w;
      },

      updateWallet: (id, patch) => set((s) => ({ wallets: s.wallets.map((w) => (w.id === id ? { ...w, ...patch, id } : w)) })),

      archiveWallet: (id, archived) =>
        set((s) => {
          const wallets = s.wallets.map((w) => (w.id === id ? { ...w, archived } : w));
          if (wallets.every((w) => w.archived)) return {}; // always keep one live wallet
          const active = s.settings.activeWalletId === id && archived ? 'all' : s.settings.activeWalletId;
          return { wallets, settings: { ...s.settings, activeWalletId: active } };
        }),

      deleteWallet: (id) =>
        set((s) => {
          const rest = s.wallets.filter((w) => w.id !== id);
          if (rest.length === 0) return {};
          const home = rest.find((w) => !w.archived) ?? rest[0];
          return {
            wallets: rest,
            // keep the history: purchases move to another wallet instead of vanishing
            purchases: s.purchases.map((p) => (p.walletId === id ? { ...p, walletId: home.id } : p)),
            wishes: s.wishes.map((x) => (x.walletId === id ? { ...x, walletId: home.id } : x)),
            settings: { ...s.settings, activeWalletId: s.settings.activeWalletId === id ? home.id : s.settings.activeWalletId },
          };
        }),

      addCustomCategory: (label, group, icon) => {
        const meta = makeCustomCategory(`c_${uid()}`, label, group, icon);
        const customCats = [...get().customCats, meta];
        registerCustomCategories(customCats);
        set({ customCats });
        return meta;
      },

      removeCustomCategory: (id) => {
        const customCats = get().customCats.filter((c) => c.id !== id);
        registerCustomCategories(customCats);
        set({ customCats });
      },

      setCategoryHidden: (id, hidden) =>
        set((s) => ({
          hiddenCats: hidden ? Array.from(new Set([...s.hiddenCats, id])) : s.hiddenCats.filter((x) => x !== id),
        })),

      logPurchase: (input) => {
        const st = get();
        const wallet = targetWallet(st, input.walletId);
        const ts = input.ts ?? Date.now();
        const before = computeWalletBudget(wallet, st.settings, st.purchases, ts);
        const purchase: Purchase = {
          id: uid(),
          walletId: wallet.id,
          ts,
          amountCents: input.amountCents,
          category: input.category,
          merchant: input.merchant?.trim() || undefined,
          method: input.method,
          note: input.note,
          roast: '',
          source: input.source ?? 'manual',
          wishId: input.wishId,
        };
        const all = [...st.purchases, purchase];
        const after = computeWalletBudget(wallet, st.settings, all, ts);
        const weekStart = startOfWeek(ts, st.settings.weekStartsOn);
        const countThisWeek = all.filter(
          (p) => p.walletId === wallet.id && p.category === input.category && p.ts >= weekStart && p.ts < after.weekEnd,
        ).length;
        purchase.roast = roastFor({
          category: input.category,
          amountCents: input.amountCents,
          level: st.settings.roastLevel,
          bodyRoasts: st.settings.bodyRoasts,
          unit: displayUnit(st.settings.unit, st.settings.hourlyCents, st.settings.unitMode, st.settings.shiftHours),
          bigAtCents: st.settings.unit.priceCents * 2,
          hourlyCents: st.settings.hourlyCents,
          countThisWeek,
          overBudget: after.overBudget,
          weeklyBudgetCents: after.budgetCents,
          method: input.method,
          hour: new Date(ts).getHours(),
          merchant: purchase.merchant,
          seed: (Math.floor(ts / 1000) + all.length * 7 + input.amountCents) % 9973,
          recent: st.recentRoasts,
          fmt: moneyFmt(st.settings),
          lang: st.settings.language,
          melbourne: st.settings.currency === 'AUD',
        });
        const unlockedNow = unlockedStickerIds({ purchases: all, wishes: st.wishes, shame: st.shame, settings: st.settings, wallets: st.wallets, now: ts });
        const newStickers = unlockedNow.filter((id) => !st.seenStickers.includes(id));
        set({
          purchases: all,
          recentRoasts: [purchase.roast, ...st.recentRoasts].slice(0, 12),
        });
        return { purchase, roast: purchase.roast, before, after, newStickers };
      },

      removePurchase: (id) => set((s) => ({ purchases: s.purchases.filter((p) => p.id !== id), shame: s.shame.filter((x) => x.purchaseId !== id) })),

      updatePurchase: (id, patch) =>
        set((s) => ({
          purchases: s.purchases.map((p) => (p.id === id ? { ...p, ...patch } : p)),
          // a shame-shelf item made from this buy shows the same amount
          shame: patch.amountCents != null ? s.shame.map((x) => (x.purchaseId === id ? { ...x, amountCents: patch.amountCents as number } : x)) : s.shame,
        })),

      answerRegret: (id, regret) =>
        set((s) => ({ purchases: s.purchases.map((p) => (p.id === id ? { ...p, regret, regretTs: Date.now() } : p)) })),

      addShame: (item) => {
        const full: ShameItem = { ...item, id: uid(), ts: item.ts ?? Date.now() };
        set((s) => ({ shame: [full, ...s.shame] }));
        return full;
      },

      removeShame: (id) => set((s) => ({ shame: s.shame.filter((x) => x.id !== id) })),

      addWish: (label, amountCents, category, hours) => {
        const st = get();
        const w = { ...createWish(label, amountCents, category, hours, Date.now()), walletId: targetWallet(st).id };
        set((s) => ({ wishes: [w, ...s.wishes] }));
        if (st.settings.notifyWish) {
          scheduleWishUnlock({ lang: st.settings.language, what: label, amount: formatMoney(amountCents, { fmt: moneyFmt(st.settings) }), unlockTs: w.unlockTs }).then((id) => {
            if (id) set((s) => ({ wishes: s.wishes.map((x) => (x.id === w.id ? { ...x, notifId: id } : x)) }));
          });
        }
        return w;
      },

      decideWish: (id, outcome) => {
        const w = get().wishes.find((x) => x.id === id);
        if (!w) return null;
        cancelNotification(w.notifId);
        set((s) => ({
          wishes: s.wishes.map((x) => (x.id === id ? { ...x, status: outcome, decidedTs: Date.now(), notifId: undefined } : x)),
        }));
        if (outcome === 'ditched') return null;
        return get().logPurchase({
          amountCents: w.amountCents,
          category: w.category,
          merchant: w.label,
          method: 'card',
          source: 'cooling',
          wishId: w.id,
          walletId: w.walletId,
        });
      },

      markStickersSeen: (ids) => set((s) => ({ seenStickers: Array.from(new Set([...s.seenStickers, ...ids])) })),

      restoreBackup: (data) => {
        registerCustomCategories(data.customCats);
        set({
          settings: data.settings,
          wallets: data.wallets,
          purchases: data.purchases,
          wishes: data.wishes,
          shame: data.shame,
          customCats: data.customCats,
          hiddenCats: data.hiddenCats,
          recentRoasts: data.recentRoasts,
          seenStickers: data.seenStickers,
        });
      },

      resetAll: () => {
        registerCustomCategories([]);
        set({
          settings: { ...defaultSettings(), language: get().settings.language, theme: get().settings.theme },
          wallets: [defaultWallet()],
          purchases: [],
          wishes: [],
          shame: [],
          customCats: [],
          hiddenCats: [],
          recentRoasts: [],
          seenStickers: [],
        });
      },
    }),
    {
      name: 'brokey-v1',
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (s) => ({
        settings: s.settings,
        wallets: s.wallets,
        purchases: s.purchases,
        wishes: s.wishes,
        shame: s.shame,
        customCats: s.customCats,
        hiddenCats: s.hiddenCats,
        recentRoasts: s.recentRoasts,
        seenStickers: s.seenStickers,
      }),
      // keep new settings keys filled in for people whose saved data predates them
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<typeof current>;
        return { ...current, ...saved, settings: { ...current.settings, ...(saved.settings ?? {}) } };
      },
      onRehydrateStorage: () => (state) => {
        registerCustomCategories(state?.customCats ?? []);
        useStore.setState({ hydrated: true });
      },
    },
  ),
);

// Fallback: some environments never call onRehydrate (e.g. nothing stored yet on a slow web storage).
setTimeout(() => {
  if (!useStore.getState().hydrated) useStore.setState({ hydrated: true });
}, 1500);

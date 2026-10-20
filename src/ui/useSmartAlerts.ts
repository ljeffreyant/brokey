import { useEffect } from 'react';
import { Platform } from 'react-native';
import { computeOverview, detectRecurring, forecastRunOut, formatMoney } from '../core';
import { syncPaceAlert, syncRecurringReminders } from '../notify';
import { moneyFmt, useStore } from '../store';

/**
 * Keeps the two self-made heads-ups (pace warning, repeating charges) in step with the data.
 * Waits a beat after each change so a burst of logging only reschedules once.
 */
export function useSmartAlerts(): void {
  const wallets = useStore((s) => s.wallets);
  const purchases = useStore((s) => s.purchases);
  const settings = useStore((s) => s.settings);

  useEffect(() => {
    if (Platform.OS === 'web' || !settings.onboarded) return;
    const id = setTimeout(() => {
      const now = Date.now();
      const live = new Set(wallets.filter((w) => !w.archived).map((w) => w.id));
      const mine = purchases.filter((p) => live.has(p.walletId));
      const fc = forecastRunOut(computeOverview(wallets, settings, purchases, now).total, now);
      syncPaceAlert({ on: settings.notifyPace, lang: settings.language, runOutTs: fc?.runOutTs ?? null, now });
      const fmt = moneyFmt(settings);
      syncRecurringReminders({
        on: settings.notifyRecurring,
        lang: settings.language,
        now,
        items: detectRecurring(mine, now).map((r) => ({ key: r.key, label: r.label, amountLabel: formatMoney(r.amountCents, { fmt }), nextTs: r.nextTs })),
      });
    }, 1500);
    return () => clearTimeout(id);
  }, [wallets, purchases, settings]);
}

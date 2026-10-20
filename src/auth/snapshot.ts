import { CategoryMeta, Purchase, Settings, ShameItem, Wallet, WishItem, registerCustomCategories } from '../core';
import { useStore } from '../store';

export const SNAPSHOT_VERSION = 1;

/** Everything that makes up a person's data. Device-only things (hydration flag, recent roasts) are left out. */
export interface Snapshot {
  v: number;
  settings: Settings;
  wallets: Wallet[];
  purchases: Purchase[];
  wishes: WishItem[];
  shame: ShameItem[];
  customCats: CategoryMeta[];
  hiddenCats: string[];
  seenStickers: string[];
}

export function takeSnapshot(): Snapshot {
  const s = useStore.getState();
  return {
    v: SNAPSHOT_VERSION,
    settings: s.settings,
    wallets: s.wallets,
    purchases: s.purchases,
    wishes: s.wishes,
    shame: s.shame,
    customCats: s.customCats,
    hiddenCats: s.hiddenCats,
    seenStickers: s.seenStickers,
  };
}

export function applySnapshot(snap: Snapshot): void {
  if (!snap || typeof snap !== 'object' || snap.v !== SNAPSHOT_VERSION) return;
  registerCustomCategories(snap.customCats ?? []);
  useStore.setState({
    settings: { ...useStore.getState().settings, ...snap.settings },
    wallets: snap.wallets ?? [],
    purchases: snap.purchases ?? [],
    wishes: snap.wishes ?? [],
    shame: snap.shame ?? [],
    customCats: snap.customCats ?? [],
    hiddenCats: snap.hiddenCats ?? [],
    seenStickers: snap.seenStickers ?? [],
  });
}

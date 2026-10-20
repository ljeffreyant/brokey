import { Platform } from 'react-native';
import * as StoreReview from 'expo-store-review';
import { shouldAskForReview } from '../core';
import { useStore } from '../store';

/**
 * Ask for an App Store rating if it is fair to (see core/review.ts). Call it after a good moment, never from a button.
 * The system decides whether the prompt actually shows; it is capped by Apple and is skipped in TestFlight.
 */
export async function maybeAskForReview(): Promise<void> {
  if (Platform.OS !== 'ios') return;
  try {
    const { settings, purchases } = useStore.getState();
    const now = Date.now();
    if (!shouldAskForReview({ now, startedTs: settings.startedTs, purchaseCount: purchases.length, asks: settings.reviewAsks ?? 0, lastAskTs: settings.lastReviewAskTs ?? null })) return;
    if (!(await StoreReview.isAvailableAsync())) return;
    // count it before asking, so a crash or a slow prompt can never lead to asking twice
    useStore.getState().updateSettings({ reviewAsks: (settings.reviewAsks ?? 0) + 1, lastReviewAskTs: now });
    await StoreReview.requestReview();
  } catch {
    /* never let a rating prompt break the app */
  }
}

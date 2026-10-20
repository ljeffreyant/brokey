/**
 * When it is fair to ask for an App Store rating. Apple lets an app show the system prompt at most three times a year
 * whatever we do, so we ask rarely, only after the person has really used the app, and only at a happy moment.
 */
export const REVIEW_MIN_DAYS = 5;
export const REVIEW_MIN_BUYS = 8;
export const REVIEW_GAP_DAYS = 120;
export const REVIEW_MAX_ASKS = 3;

export interface ReviewState {
  now: number;
  /** when the person finished onboarding */
  startedTs: number;
  /** purchases logged so far */
  purchaseCount: number;
  /** how many times we have asked */
  asks: number;
  lastAskTs: number | null;
}

const DAY = 86_400_000;

export function shouldAskForReview(s: ReviewState): boolean {
  if (s.asks >= REVIEW_MAX_ASKS) return false;
  if (s.purchaseCount < REVIEW_MIN_BUYS) return false;
  if (s.now - s.startedTs < REVIEW_MIN_DAYS * DAY) return false;
  if (s.lastAskTs != null && s.now - s.lastAskTs < REVIEW_GAP_DAYS * DAY) return false;
  return true;
}

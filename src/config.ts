/**
 * Switches that decide what ships. Flip these when you build for TestFlight or a personal build.
 */

/** Body-related roast lines ("fat fuck" etc). Off for the App Store build: guideline 1.1 / 1.1.1 risk. */
export const BODY_ROASTS_AVAILABLE = false;

/** Accounts and cloud sync. Off until a Supabase project exists. When on, in-app account deletion is required (guideline 5.1.1(v)). */
export const AUTH_ENABLED = false;

/** Fill these in before submitting. The preflight script fails while they are placeholders. */
export const SUPPORT_EMAIL = 'support@brokey.example';
export const PRIVACY_URL = 'https://brokey.example/privacy';
export const TERMS_URL = 'https://brokey.example/terms';
export const SUPPORT_URL = 'https://brokey.example/support';

export const APP_VERSION = '1.0.0';

/**
 * Switches that decide what ships. Flip these when you build for TestFlight or a personal build.
 */

/** Body-related roast lines ("fat fuck" etc). Off for the App Store build: guideline 1.1 / 1.1.1 risk. */
export const BODY_ROASTS_AVAILABLE = false;

/** Accounts and cloud sync. Off until a Supabase project exists. When on, in-app account deletion is required (guideline 5.1.1(v)). */
export const AUTH_ENABLED = false;

/** Home screen widgets need a native widget target that is not built yet. Keep off so the app has no "coming soon" screens (App Store guideline 2.1). */
export const WIDGETS_AVAILABLE = false;

/** Fill these in before submitting. The preflight script fails while they are placeholders. */
export const SUPPORT_EMAIL = 'support@brokey.example';
export const PRIVACY_URL = 'https://ljeffreyant.github.io/brokey/site/privacy.html';
export const TERMS_URL = 'https://ljeffreyant.github.io/brokey/site/terms.html';
export const SUPPORT_URL = 'https://ljeffreyant.github.io/brokey/site/support.html';

/** The website folder. Short links live under it: <SITE_BASE>/go/<channel>/ */
export const SITE_BASE = 'https://ljeffreyant.github.io/brokey/site';

/**
 * Short links for posters, bios and QR codes. Each channel gets its own page that forwards to the right place,
 * so you can change where everything points later without reprinting anything.
 * Fill these in as they exist (all optional): until then the links go to the site home.
 */
export const APP_STORE_ID = ''; // the number in apps.apple.com/app/id123456789
export const APP_STORE_PROVIDER_TOKEN = ''; // the pt= value from your first campaign link in App Store Connect
export const TESTFLIGHT_URL = ''; // https://testflight.apple.com/join/XXXXXXXX while you are still testing
export const GO_CHANNELS = ['tiktok', 'instagram', 'linkedin', 'poster', 'sticker', 'friends', 'clubs', 'crew-1', 'crew-2', 'crew-3'];

export const APP_VERSION = '1.0.0';

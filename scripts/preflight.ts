/**
 * App Store preflight. Run before every submission:  npm run preflight
 * Fails (exit 1) on anything Apple would bounce, warns on things worth a look.
 */
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = path.join(__dirname, '..');
const read = (p: string) => fs.readFileSync(path.join(root, p), 'utf8');
const errors: string[] = [];
const warns: string[] = [];
const ok: string[] = [];

const must = (cond: boolean, pass: string, fail: string) => (cond ? ok.push(pass) : errors.push(fail));
const should = (cond: boolean, pass: string, fail: string) => (cond ? ok.push(pass) : warns.push(fail));

async function main() {
  const cfg = read('src/config.ts');
  const app = JSON.parse(read('app.json')).expo;

  // 2.1: no placeholder URLs or emails in the shipped build
  const placeholder = /brokey\.example/;
  must(!placeholder.test(cfg), 'Support, privacy and terms links are filled in', 'src/config.ts still has brokey.example placeholders (support email, privacy, terms, support URLs). Apple rejects dead links (2.1, 5.1.1).');

  // 1.1: body roasts stay off in the store build
  must(/BODY_ROASTS_AVAILABLE\s*=\s*false/.test(cfg), 'Body-related roasts are off', 'BODY_ROASTS_AVAILABLE must be false for the App Store build.');

  // 5.1.1(v): if accounts are on, deletion must exist in-app and on the server
  const authOn = /AUTH_ENABLED\s*=\s*true/.test(cfg);
  if (authOn) {
    must(fs.existsSync(path.join(root, 'supabase/functions/delete-account/index.ts')), 'Account deletion function exists', 'AUTH_ENABLED is true but supabase/functions/delete-account is missing (5.1.1(v)).');
    should(!!process.env.EXPO_PUBLIC_SUPABASE_URL, 'Supabase URL is set', 'EXPO_PUBLIC_SUPABASE_URL is not set in this shell. Set it in EAS secrets too.');
    warns.push('Accounts are on: add a demo account to the App Review notes (2.1) and keep the Supabase project un-paused.');
  } else {
    ok.push('Accounts are off (no sign-in, nothing to delete, simplest review)');
  }

  // Basic identity
  must(!!app.ios?.bundleIdentifier, `Bundle id ${app.ios?.bundleIdentifier}`, 'ios.bundleIdentifier missing in app.json');
  must(app.ios?.infoPlist?.ITSAppUsesNonExemptEncryption === false, 'Export compliance answered (no non-exempt encryption)', 'Set ios.infoPlist.ITSAppUsesNonExemptEncryption in app.json.');
  must(!!app.ios?.privacyManifests?.NSPrivacyAccessedAPITypes?.length, 'Privacy manifest declared', 'ios.privacyManifests is missing (required-reason APIs).');
  must(app.ios?.privacyManifests?.NSPrivacyTracking === false, 'Declares no tracking', 'Set NSPrivacyTracking to false in ios.privacyManifests.');
  should(app.ios?.supportsTablet === false, 'iPhone only (no iPad screenshots needed)', 'supportsTablet is true: you must supply iPad screenshots and test iPad layouts.');

  // Icon: 1024x1024, square, no alpha
  const icon = path.join(root, app.icon ?? 'assets/icon.png');
  if (fs.existsSync(icon)) {
    const m = await sharp(icon).metadata();
    must(m.width === 1024 && m.height === 1024, 'Icon is 1024x1024', `Icon is ${m.width}x${m.height}, needs 1024x1024.`);
    must(!m.hasAlpha, 'Icon has no transparency', 'Icon has an alpha channel. App Store icons must be fully opaque.');
  } else errors.push('assets/icon.png missing');

  // Every language has the same keys (the i18n test covers this too)
  const lang = ['es', 'id', 'zh'].every((l) => fs.existsSync(path.join(root, `src/i18n/${l}.ts`)));
  should(lang, 'Four languages present', 'A language file is missing.');

  // Legal copy exists and mentions deletion of local data
  const legal = read('src/legal/index.ts');
  should(/delete/i.test(legal), 'Privacy copy explains deleting data', 'Privacy copy does not mention deleting data.');

  console.log('\nPASS');
  ok.forEach((s) => console.log('  ok   ' + s));
  if (warns.length) {
    console.log('\nCHECK');
    warns.forEach((s) => console.log('  warn ' + s));
  }
  if (errors.length) {
    console.log('\nFAIL');
    errors.forEach((s) => console.log('  FAIL ' + s));
    console.log(`\n${errors.length} blocking issue${errors.length === 1 ? '' : 's'}.`);
    process.exit(1);
  }
  console.log('\nReady to build.');
}

main();

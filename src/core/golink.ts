/**
 * Where a short link like /site/go/tiktok/ should send people.
 *   1. The App Store page, tagged with the channel so App Store Connect can show installs per channel.
 *   2. Before launch: the public TestFlight link.
 *   3. Otherwise: the Brokey site home, so a QR printed early never dead-ends.
 */
export interface GoConfig {
  appStoreId: string;
  providerToken: string;
  testflightUrl: string;
  /** where to land when nothing else is set up yet */
  fallback: string;
}

/** App Store campaign tokens are up to 30 characters; keep to letters, digits, dash and underscore so they are safe in a URL. */
export function campaignToken(channel: string): string {
  return channel
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 30);
}

export function goTarget(channel: string, cfg: GoConfig): string {
  const id = cfg.appStoreId.replace(/\D/g, '');
  if (id) {
    const q: string[] = [];
    if (cfg.providerToken.trim()) q.push(`pt=${encodeURIComponent(cfg.providerToken.trim())}`);
    const ct = campaignToken(channel);
    if (ct) q.push(`ct=${ct}`);
    q.push('mt=8');
    return `https://apps.apple.com/app/id${id}?${q.join('&')}`;
  }
  if (/^https:\/\/testflight\.apple\.com\/join\/[A-Za-z0-9]+$/.test(cfg.testflightUrl.trim())) return cfg.testflightUrl.trim();
  return cfg.fallback;
}

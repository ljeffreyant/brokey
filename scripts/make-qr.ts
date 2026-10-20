/**
 * QR codes for every go-link channel, as PNG (for print and stories) and SVG (for scaling).
 *   npx tsx scripts/make-qr.ts            ->  qr/<channel>.png and qr/<channel>.svg
 * The QR holds the short link (<SITE_BASE>/go/<channel>/), not the App Store address, so what it points to can change later.
 */
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import { GO_CHANNELS, SITE_BASE } from '../src/config';

const out = path.join(__dirname, '..', 'qr');
fs.mkdirSync(out, { recursive: true });

async function main() {
  const lines: string[] = [];
  for (const ch of GO_CHANNELS) {
    const url = `${SITE_BASE}/go/${ch}/`;
    const opts = { margin: 2, errorCorrectionLevel: 'M' as const, color: { dark: '#2A1B14', light: '#FFFFFF' } };
    await QRCode.toFile(path.join(out, `${ch}.png`), url, { ...opts, type: 'png', width: 1024 });
    fs.writeFileSync(path.join(out, `${ch}.svg`), await QRCode.toString(url, { ...opts, type: 'svg' }));
    lines.push(`${ch.padEnd(10)} ${url}`);
  }
  fs.writeFileSync(path.join(out, 'links.txt'), lines.join('\n') + '\n');
  console.log(lines.join('\n'));
}

main();

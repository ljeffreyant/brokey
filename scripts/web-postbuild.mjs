// After `expo export --platform web`: make the build installable on a phone home screen
// (Safari: Share > Add to Home Screen) and usable as a GitHub Pages site.
import { copyFileSync, readFileSync, writeFileSync } from 'node:fs';

const file = 'dist/index.html';
let html = readFileSync(file, 'utf8');

const tags = [
  '<meta name="apple-mobile-web-app-capable" content="yes" />',
  '<meta name="mobile-web-app-capable" content="yes" />',
  '<meta name="apple-mobile-web-app-status-bar-style" content="default" />',
  '<meta name="apple-mobile-web-app-title" content="Brokey" />',
  '<meta name="theme-color" content="#FFF6E6" />',
  '<link rel="manifest" href="manifest.webmanifest" />',
  '<link rel="apple-touch-icon" href="apple-touch-icon.png" />',
].join('\n    ');

if (!html.includes('apple-mobile-web-app-capable')) html = html.replace('</head>', `    ${tags}\n  </head>`);
// let the app draw under the notch; safe-area insets then come from the phone
html = html.replace('shrink-to-fit=no"', 'shrink-to-fit=no, viewport-fit=cover"');

writeFileSync(file, html);
// GitHub Pages serves 404.html for unknown paths; the app is a single page, so reuse it
copyFileSync(file, 'dist/404.html');
console.log('web build ready: dist/index.html (+ manifest, icons, 404.html)');

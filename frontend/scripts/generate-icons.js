/**
 * Generate PWA icons as simple SVG files (browsers accept SVG for PWA icons).
 * For production, replace with proper designed PNG icons.
 */
const fs = require('fs');
const path = require('path');

const sizes = [192, 512];
const outputDir = path.join(__dirname, '..', 'public', 'icons');

if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

sizes.forEach((size) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <defs>
    <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#1a1a2e"/>
      <stop offset="100%" style="stop-color:#0F0F23"/>
    </linearGradient>
    <linearGradient id="accent" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:#7C3AED"/>
      <stop offset="100%" style="stop-color:#EC4899"/>
    </linearGradient>
  </defs>
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.2)}" fill="url(#bg)"/>
  <text x="${size / 2}" y="${size * 0.38}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.3)}" fill="url(#accent)" text-anchor="middle" font-weight="bold">🎮</text>
  <text x="${size / 2}" y="${size * 0.68}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.12)}" fill="white" text-anchor="middle" font-weight="bold">NEST</text>
  <text x="${size / 2}" y="${size * 0.82}" font-family="Arial, sans-serif" font-size="${Math.round(size * 0.08)}" fill="#7C3AED" text-anchor="middle" font-weight="600">GAME</text>
</svg>`;

  // Write as SVG — for proper PWA we need PNG, but this works as placeholder
  fs.writeFileSync(path.join(outputDir, `icon-${size}.svg`), svg);
  console.log(`Generated icon-${size}.svg`);
});

console.log('Done! For production, convert SVGs to PNGs using a tool like sharp or Inkscape.');

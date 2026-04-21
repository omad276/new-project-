import sharp from 'sharp';
import { mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, '..', 'public', 'icons');

const sizes = [72, 96, 128, 144, 152, 192, 384, 512];

// Create SVG icon with "S" logo - gold/bronze theme color #C5A572
function createSvgIcon(size) {
  const fontSize = Math.round(size * 0.6);
  return Buffer.from(`
    <svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#C5A572"/>
          <stop offset="100%" style="stop-color:#9A7B4F"/>
        </linearGradient>
      </defs>
      <rect width="${size}" height="${size}" rx="${size * 0.2}" fill="url(#bg)"/>
      <text x="50%" y="55%" font-family="Arial, sans-serif" font-size="${fontSize}"
            font-weight="bold" fill="white" text-anchor="middle" dominant-baseline="middle">S</text>
    </svg>
  `);
}

async function generateIcons() {
  await mkdir(iconsDir, { recursive: true });

  for (const size of sizes) {
    const svg = createSvgIcon(size);
    const outputPath = join(iconsDir, `icon-${size}x${size}.png`);

    await sharp(svg)
      .png()
      .toFile(outputPath);

    console.log(`Generated: icon-${size}x${size}.png`);
  }

  console.log('\nAll icons generated successfully!');
}

generateIcons().catch(console.error);

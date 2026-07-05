import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

// Use the current working directory (project root) so script works on Windows
const projectRoot = process.cwd();
const srcDir = path.join(projectRoot, 'src', 'assets');
const outDir = path.join(srcDir, 'optimized');

const images = [
  'about-hero-optimized.jpg',
  'campaign-food.jpg',
  'campaign-education.jpg',
  'campaign-health.jpg',
  'campaign-environment.jpg',
  'campaign-food-thumb.jpg',
  'campaign-education-thumb.jpg',
  'campaign-health-thumb.jpg',
  'campaign-environment-thumb.jpg',
  'registration.jpeg',
  'footer-image-optimized.jpg',
  'hero-lcp.jpg',
];

const sizes = [400, 800, 1200, 1800];

async function ensureOut() {
  await fs.promises.mkdir(outDir, { recursive: true });
}

async function processImage(name) {
  const input = path.join(srcDir, name);
  if (!fs.existsSync(input)) {
    console.warn('Skipped (not found):', input);
    return;
  }

  for (const size of sizes) {
    const basename = name.replace(/\.(jpe?g|png|jpeg)$/i, '');
    const webpOut = path.join(outDir, `${basename}-${size}.webp`);
    const avifOut = path.join(outDir, `${basename}-${size}.avif`);

    await sharp(input).resize({ width: size }).webp({ quality: 80 }).toFile(webpOut);
    await sharp(input).resize({ width: size }).avif({ quality: 60 }).toFile(avifOut);
  }

  // Also produce a compressed original-format fallback (jpg/jpeg)
  const fallbackOut = path.join(outDir, name);
  await sharp(input).jpeg({ quality: 80 }).toFile(fallbackOut);
  console.log('Optimized:', name);
}

(async () => {
  await ensureOut();
  for (const img of images) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await processImage(img);
    } catch (err) {
      console.error('Error processing', img, err);
    }
  }
  console.log('Image optimization complete. Output:', outDir);
})();

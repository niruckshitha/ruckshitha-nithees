// Turns your full-size photos in photos-original/ into small, fast WebP files
// in public/photos/, plus the WhatsApp preview image public/og.jpg.
//
//   npm run optimize-images
//
// To swap a photo: change the file name below (and optionally the crop),
// then run the command again.
//
// crop = { top, left, width, height } as FRACTIONS of the (auto-rotated) photo,
// e.g. { top: 0.3, left: 0, width: 1, height: 0.6 }. Leave it out to use the
// whole photo. `aspect` (w/h) crops from the centre of the crop box if given.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'photos-original';
const OUT = 'public/photos';
const MAX = 1600;

const PHOTOS = {
  // Hero — her arm wrapped around yours, both smiling (Jan 2026)
  hero: { file: 'IMG_20260110_143724.jpg', aspect: 3 / 4, crop: { top: 0.235, left: 0.01, width: 0.82, height: 0.49 }, max: 1100 },
  // Then & Now
  then: { file: 'IMG_20241128_130704.jpg', aspect: 3 / 4, crop: { top: 0.1, left: 0, width: 1, height: 0.66 }, max: 1440 },
  now: { file: 'IMG_20260110_142850.jpg', aspect: 3 / 4, crop: { top: 0.28, left: 0, width: 1, height: 0.66 }, max: 1440 },
  // Timeline chapters
  t1: { file: 'IMG_20241125_125306.jpg', aspect: 4 / 5, crop: { top: 0.3, left: 0, width: 1, height: 0.6 }, max: 1000 },
  t2: { file: 'IMG_20241128_131251.jpg', aspect: 4 / 5, crop: { top: 0.18, left: 0, width: 1, height: 0.6 }, max: 1000 },
  t3: { file: 'IMG_20241125_125356.jpg', aspect: 4 / 5, crop: { top: 0.06, left: 0, width: 1, height: 0.64 }, max: 1000 },
  t4: { file: 'IMG_20260110_143740.jpg', aspect: 4 / 5, crop: { top: 0.28, left: 0, width: 1, height: 0.6 }, max: 1000 },
  t5: { file: 'IMG_20260110_154857.jpg', aspect: 4 / 5, crop: { top: 0.3, left: 0, width: 1, height: 0.6 }, max: 1000 },
  t6: { file: 'IMG_20260110_154951.jpg', aspect: 4 / 5, crop: { top: 0.33, left: 0, width: 1, height: 0.6 }, max: 1000 },
};

// "Our Memories" gallery (end of the page). Order here = order on the page.
// Each becomes public/photos/gallery/<name>.webp (1200px) + <name>-sm.webp (600px).
const GALLERY = {
  g1: { file: 'IMG_20260110_143637.jpg', aspect: 2 / 3, crop: { top: 0.3, left: 0, width: 1, height: 0.7 } },
  g2: { file: 'IMG_20241128_131247.jpg', aspect: 3 / 4, crop: { top: 0.14, left: 0, width: 1, height: 0.62 } },
  g3: { file: 'IMG_20260110_154917_1.jpg', aspect: 4 / 3, crop: { top: 0, left: 0.17, width: 0.6, height: 1 } },
  g4: { file: 'IMG_20241125_125255.jpg', aspect: 4 / 5, crop: { top: 0.3, left: 0, width: 1, height: 0.58 } },
  g5: { file: 'IMG_20260110_155028.jpg', aspect: 2 / 3, crop: { top: 0.25, left: 0, width: 1, height: 0.72 } },
  g6: { file: 'IMG_20260110_154849.jpg', aspect: 3 / 4, crop: { top: 0.26, left: 0, width: 1, height: 0.62 } },
  g7: { file: 'IMG_20241128_130700.jpg', aspect: 3 / 4, crop: { top: 0.1, left: 0, width: 1, height: 0.62 } },
  g8: { file: 'IMG_20260110_143805_1.jpg', aspect: 2 / 3, crop: { top: 0.31, left: 0, width: 1, height: 0.69 } },
  g9: { file: 'IMG_20241125_125346.jpg', aspect: 4 / 5, crop: { top: 0.32, left: 0, width: 1, height: 0.58 } },
  g10: { file: 'IMG_20260110_142850.jpg', aspect: 3 / 4, crop: { top: 0.27, left: 0, width: 1, height: 0.62 } },
};

// WhatsApp / social preview (1200×630), cropped from the hero photo
const OG = { file: PHOTOS.hero.file, crop: { top: 0.3, left: 0, width: 1, height: 0.3 } };

async function load(file, crop, aspect) {
  const src = path.join(SRC, file);
  if (!fs.existsSync(src)) throw new Error(`Missing ${src}`);
  // Bake EXIF rotation first so crop fractions match what you see.
  const rotated = await sharp(src).rotate().toBuffer();
  const { width: W, height: H } = await sharp(rotated).metadata();
  let img = sharp(rotated);
  let box = { left: 0, top: 0, width: W, height: H };
  if (crop) {
    box = {
      left: Math.round(crop.left * W),
      top: Math.round(crop.top * H),
      width: Math.round(crop.width * W),
      height: Math.round(crop.height * H),
    };
  }
  if (aspect) {
    // shrink the box to the requested aspect, keeping its centre
    const cur = box.width / box.height;
    if (cur > aspect) {
      const w = Math.round(box.height * aspect);
      box.left += Math.round((box.width - w) / 2);
      box.width = w;
    } else {
      const h = Math.round(box.width / aspect);
      box.top += Math.round((box.height - h) / 2);
      box.height = h;
    }
  }
  box.left = Math.max(0, Math.min(box.left, W - 1));
  box.top = Math.max(0, Math.min(box.top, H - 1));
  box.width = Math.min(box.width, W - box.left);
  box.height = Math.min(box.height, H - box.top);
  return img.extract(box);
}

fs.mkdirSync(OUT, { recursive: true });
for (const [name, cfg] of Object.entries(PHOTOS)) {
  const img = await load(cfg.file, cfg.crop, cfg.aspect);
  const max = cfg.max ?? MAX;
  const info = await img
    .resize({ width: max, height: max, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(OUT, `${name}.webp`));
  console.log(`✓ ${name}.webp  ${info.width}×${info.height}  ${(info.size / 1024).toFixed(0)} KB`);
}

const og = await load(OG.file, OG.crop, 1200 / 630);
await og.resize(1200, 630, { fit: 'cover' }).jpeg({ quality: 80, mozjpeg: true }).toFile('public/og.jpg');
console.log('✓ og.jpg  1200×630');

// Gallery
const GOUT = path.join(OUT, 'gallery');
fs.mkdirSync(GOUT, { recursive: true });
const sizes = {};
for (const [name, cfg] of Object.entries(GALLERY)) {
  const base = await (await load(cfg.file, cfg.crop, cfg.aspect)).toBuffer();
  const big = await sharp(base)
    .resize({ width: 1200, height: 1200, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 72, effort: 6 })
    .toFile(path.join(GOUT, `${name}.webp`));
  await sharp(base)
    .resize({ width: 600, height: 600, fit: 'inside', withoutEnlargement: true })
    .webp({ quality: 70, effort: 6 })
    .toFile(path.join(GOUT, `${name}-sm.webp`));
  sizes[`/photos/gallery/${name}.webp`] = { w: big.width, h: big.height };
  console.log(`✓ gallery/${name}.webp  ${big.width}×${big.height}  ${(big.size / 1024).toFixed(0)} KB`);
}
// Sizes for the page (prevents layout jumps while photos load). Generated — don't edit.
fs.writeFileSync('src/gallery-sizes.json', JSON.stringify(sizes, null, 2) + '\n');

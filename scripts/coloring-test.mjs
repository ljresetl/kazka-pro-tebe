// Порівняння способів зробити розмальовку з ілюстрації (безкоштовно, без ШІ).
//   node scripts/coloring-test.mjs <картинка> <вихідна-тека>
import { mkdirSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

const [src, out = "coloring-test"] = process.argv.slice(2);
mkdirSync(out, { recursive: true });
const N = 768;

async function gray(blur) {
  const { data, info } = await sharp(src).resize(N, N).grayscale().blur(blur).raw().toBuffer({ resolveWithObject: true });
  return { data, w: info.width, h: info.height };
}

function save(buf, w, h, name) {
  return sharp(buf, { raw: { width: w, height: h, channels: 1 } }).png().toFile(path.join(out, name));
}

// 1) Як зараз: Собель по яскравості.
{
  const { data, w, h } = await gray(1.2);
  const o = Buffer.alloc(w * h, 255);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const p = (dx, dy) => data[(y + dy) * w + x + dx];
      const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
      const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
      const m = Math.hypot(gx, gy);
      o[y * w + x] = m > 70 ? 0 : m > 40 ? 150 : 255;
    }
  await save(o, w, h, "1-now.png");
}

// 2) Плоскі кольори: спрощуємо до кількох кольорових зон і обводимо їхні межі.
{
  // Медіана прибирає текстуру, згладжування — дрібні плями.
  const flat = await sharp(src).resize(N, N).median(7).blur(1.5).png({ palette: true, colors: 10, dither: 0 }).toBuffer();
  const { data, info } = await sharp(flat).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const key = (i) => (data[i * 3] << 16) | (data[i * 3 + 1] << 8) | data[i * 3 + 2];
  // Прибираємо «острівці» кольору менші за ~вікно 5×5 (мажоритарний фільтр, 2 проходи).
  let region = new Int32Array(w * h);
  for (let i = 0; i < w * h; i++) region[i] = key(i);
  for (let pass = 0; pass < 2; pass++) {
    const next = new Int32Array(region);
    for (let y = 2; y < h - 2; y++)
      for (let x = 2; x < w - 2; x++) {
        const counts = new Map();
        for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) {
          const k = region[(y + dy) * w + x + dx];
          counts.set(k, (counts.get(k) ?? 0) + 1);
        }
        let best = region[y * w + x];
        let bc = 0;
        for (const [k, c] of counts) if (c > bc) { bc = c; best = k; }
        next[y * w + x] = best;
      }
    region = next;
  }
  const o = Buffer.alloc(w * h, 255);
  for (let y = 1; y < h - 1; y++)
    for (let x = 1; x < w - 1; x++) {
      const k = region[y * w + x];
      if (k !== region[y * w + x + 1] || k !== region[(y + 1) * w + x]) {
        // Лінія товщиною ~2 px.
        o[y * w + x] = 0;
        o[y * w + x + 1] = 0;
        o[(y + 1) * w + x] = 0;
      }
    }
  await save(o, w, h, "2-flat.png");
}

// Поруч для порівняння.
const S = 512;
await sharp({ create: { width: S * 3, height: S, channels: 3, background: "#fff" } })
  .composite([
    { input: await sharp(src).resize(S, S).toBuffer(), left: 0, top: 0 },
    { input: await sharp(path.join(out, "1-now.png")).resize(S, S).toBuffer(), left: S, top: 0 },
    { input: await sharp(path.join(out, "2-flat.png")).resize(S, S).toBuffer(), left: S * 2, top: 0 },
  ])
  .jpeg({ quality: 88 })
  .toFile(path.join(out, "compare.jpg"));
console.log("ok", path.join(out, "compare.jpg"));

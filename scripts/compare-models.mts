// Порівняння моделей художника на тих самих сторінках прикладу (платно: ~1,8 + ~0,9 Kč за сторінку).
//   npx tsx --conditions=react-server scripts/compare-models.mts <вихідна-тека>
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp, { type OverlayOptions } from "sharp";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const OUT = process.argv[2] ?? "compare";
const MODELS = ["gemini-3.1-flash-image", "gemini-2.5-flash-image"];
const PAGES = [2, 5, 8];
const { EXAMPLES } = await import("../src/lib/examples");
const { drawIllustration } = await import("../src/lib/ai-images");

const ex = EXAMPLES.find((e) => e.slug === "zlata-i-drakon")!;
const cover = readFileSync(`public/img/pryklad-obkladynka/${ex.slug}.webp`);
const reference = { mimeType: "image/webp", data: cover.toString("base64") };
mkdirSync(OUT, { recursive: true });

// Лог [usage] з drawIllustration показує токени кожного запиту.
for (const model of MODELS) {
  process.env.GEMINI_IMAGE_MODEL = model;
  await Promise.all(
    PAGES.map(async (i) => {
      const t = Date.now();
      const img = await drawIllustration(
        { gender: ex.gender, age: ex.age, heroSeed: 1, theme: ex.theme, title: ex.title, kind: "page", pageText: ex.pages[i].text, page: i, friend: ex.friend, style: ex.style },
        { a: reference, aRole: "cover" },
      );
      writeFileSync(path.join(OUT, `${model}-${i + 1}.webp`), Buffer.from(img.data, "base64"));
      console.log(`${model} сторінка ${i + 1}: ${((Date.now() - t) / 1000).toFixed(1)} с`);
    }),
  );
}

// Одна картинка для порівняння: рядок — сторінка, колонки — моделі.
const S = 512;
const HEAD = 60;
const tiles: OverlayOptions[] = [];
MODELS.forEach((model, c) => {
  const label = `<svg width="${S}" height="${HEAD}"><rect width="100%" height="100%" fill="#1f2b3a"/><text x="50%" y="40" font-size="28" font-family="Arial" fill="#fff" text-anchor="middle">${model.replace("gemini-", "")}</text></svg>`;
  tiles.push({ input: Buffer.from(label), left: c * S, top: 0 });
});
for (const [r, i] of PAGES.entries()) {
  for (const [c, model] of MODELS.entries()) {
    tiles.push({ input: await sharp(path.join(OUT, `${model}-${i + 1}.webp`)).resize(S, S).toBuffer(), left: c * S, top: HEAD + r * S });
  }
}
await sharp({ create: { width: S * MODELS.length, height: HEAD + S * PAGES.length, channels: 3, background: "#ffffff" } })
  .composite(tiles)
  .jpeg({ quality: 85 })
  .toFile(path.join(OUT, "compare.jpg"));
console.log("Готово:", path.join(OUT, "compare.jpg"));

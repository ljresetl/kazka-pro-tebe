// Домальовує сторінки прикладів (/pryklady): 12 квадратних ілюстрацій на кожен приклад,
// з обкладинкою прикладу як зразком героя. Уже намальовані файли пропускає.
//
//   npx tsx --conditions=react-server scripts/example-pages.mts            # усі приклади
//   npx tsx --conditions=react-server scripts/example-pages.mts --limit 1  # пілот: одна картинка
//   npx tsx --conditions=react-server scripts/example-pages.mts zlata-i-drakon
//
// Ключ береться з .env.local (GEMINI_API_KEY, GEMINI_IMAGE_MODEL). Кожна картинка платна (~2,5 грн).
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import sharp from "sharp";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}

const { EXAMPLES } = await import("../src/lib/examples");
const { drawIllustration } = await import("../src/lib/ai-images");
const { GoogleGenAI } = await import("@google/genai");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const TEXT_MODEL = "gemini-flash-latest";

/**
 * Українського тексту художнику не даємо — інакше він вписує слова в картинку.
 * Дешева текстова модель описує кожну сторінку англійською (один запит на приклад).
 */
async function describe(title: string, pages: string[]): Promise<string[]> {
  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: `A Ukrainian children's picture book «${title}». For each of its ${pages.length} pages write one English sentence (max 35 words) describing what the illustration should show: who does what, where, time of day, mood. Call the main hero "the child", never use names, never mention writing, signs, letters or words. Return a JSON array of ${pages.length} strings.\n\n${pages.map((t, i) => `${i + 1}. ${t}`).join("\n")}`,
    config: { responseMimeType: "application/json" },
  });
  const list = JSON.parse(res.text ?? "[]") as string[];
  if (!Array.isArray(list) || list.length !== pages.length) throw new Error("Опис сторінок не вийшов");
  return list;
}

/** Перевірка готової картинки: чи немає написів. */
async function hasText(webp: Buffer): Promise<boolean> {
  const jpeg = await sharp(webp).resize(512, 512).jpeg({ quality: 80 }).toBuffer();
  const res = await ai.models.generateContent({
    model: TEXT_MODEL,
    contents: [
      {
        role: "user",
        parts: [
          { text: 'Does this illustration contain any written letters, words, names or numbers (not counting abstract decorations)? Answer JSON {"text": true|false}.' },
          { inlineData: { mimeType: "image/jpeg", data: jpeg.toString("base64") } },
        ],
      },
    ],
    config: { responseMimeType: "application/json" },
  });
  try {
    return Boolean((JSON.parse(res.text ?? "{}") as { text?: boolean }).text);
  } catch {
    return false;
  }
}

const args = process.argv.slice(2);
const limitAt = args.indexOf("--limit");
const limit = limitAt >= 0 ? Number(args[limitAt + 1]) : Infinity;
const only = args.filter((a, i) => !a.startsWith("--") && (limitAt < 0 || i !== limitAt + 1));
const OUT = "public/img/pryklad-storinky";
const JOBS = 4;

type Job = { slug: string; index: number; run: () => Promise<void> };
const jobs: Job[] = [];

for (const ex of EXAMPLES) {
  if (only.length && !only.includes(ex.slug)) continue;
  let scenes: Promise<string[]> | null = null;
  const sceneFor = async (i: number) => (await (scenes ??= describe(ex.title, ex.pages.map((p) => p.text))))[i];
  const coverFile = `public/img/pryklad-obkladynka/${ex.slug}.webp`;
  const reference = { mimeType: "image/webp" as const, data: readFileSync(coverFile).toString("base64") };
  mkdirSync(path.join(OUT, ex.slug), { recursive: true });
  ex.pages.forEach((page, index) => {
    const file = path.join(OUT, ex.slug, `${String(index + 1).padStart(2, "0")}.webp`);
    if (existsSync(file)) return;
    jobs.push({
      slug: ex.slug,
      index,
      run: async () => {
        const img = await drawIllustration(
          {
            gender: ex.gender,
            age: ex.age,
            heroSeed: 1,
            theme: ex.theme,
            title: ex.title,
            kind: "page",
            pageText: page.text,
            illustration: page.illustration ?? (await sceneFor(index)),
            friend: ex.friend,
            style: ex.style,
          },
          { a: reference, aRole: "cover" },
        );
        const webp = await sharp(Buffer.from(img.data, "base64")).resize(1024, 1024, { fit: "cover" }).webp({ quality: 82 }).toBuffer();
        if (await hasText(webp)) throw new Error("на картинці є напис");
        writeFileSync(file, webp);
      },
    });
  });
}

const todo = jobs.slice(0, Number.isFinite(limit) ? limit : undefined);
console.log(`Малюємо ${todo.length} з ${jobs.length} потрібних ілюстрацій…`);
let done = 0;
let failed = 0;
async function worker() {
  while (todo.length) {
    const job = todo.shift()!;
    for (let attempt = 1; ; attempt++) {
      try {
        await job.run();
        console.log(`✓ ${job.slug} #${job.index + 1} (${++done})`);
        break;
      } catch (err) {
        // Не більше двох спроб на картинку — кожна коштує грошей.
        if (attempt >= 2) {
          failed++;
          console.log(`✗ ${job.slug} #${job.index + 1}: ${String(err).slice(0, 200)}`);
          break;
        }
        await new Promise((r) => setTimeout(r, 4000 * attempt));
      }
    }
  }
}
await Promise.all(Array.from({ length: JOBS }, worker));
console.log(`Готово: ${done}, помилок: ${failed}`);

// Список намальованих сторінок для src/lib/examples.ts.
const manifest: Record<string, number[]> = {};
for (const ex of EXAMPLES) {
  const have = ex.pages.map((_, i) => i).filter((i) => existsSync(path.join(OUT, ex.slug, `${String(i + 1).padStart(2, "0")}.webp`)));
  if (have.length) manifest[ex.slug] = have;
}
writeFileSync("src/lib/example-pages.json", JSON.stringify(manifest, null, 2) + "\n");

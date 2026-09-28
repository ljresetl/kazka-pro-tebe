import { z } from "zod";
import { drawIllustration, imagesConfigured } from "@/lib/ai-images";

export const maxDuration = 120;

// Малює одну ілюстрацію до казки. Браузер викликає маршрут по черзі:
// спершу обкладинку, потім кожну сторінку, передаючи обкладинку як зразок.

// Браузер надсилає лише налаштування казки; сам запит до художника-ШІ
// збирається на сервері (buildPrompt), тож ключ не використати для сторонніх картинок.
const Schema = z.object({
  gender: z.enum(["boy", "girl"]),
  age: z.number().int().min(0).max(16),
  heroSeed: z.number().int().min(0).max(1_000_000),
  theme: z.enum(["space", "forest", "sea", "dino", "castle", "meadow"]),
  title: z.string().trim().min(1).max(120),
  kind: z.enum(["cover", "page"]),
  pageText: z.string().trim().min(1).max(1500),
  illustration: z.string().trim().max(600).optional(),
  friend: z.string().trim().max(40).optional(),
  style: z.string().max(40).optional(),
  topic: z.string().max(40).optional(),
  companions: z.array(z.string().trim().max(120)).max(4).optional(),
  hasPhoto: z.boolean().optional(),
  reference: z
    .object({ mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]), data: z.string().max(4_000_000) })
    .optional(),
});

// Захист від зловживань: не більше 40 картинок на годину з однієї адреси
// (одна книжка — 7–8 картинок). Для великих навантажень — Redis/KV.
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 40;
const hits = new Map<string, number[]>();

export async function POST(request: Request) {
  if (!imagesConfigured()) return Response.json({ error: "Ілюстрації ще не налаштовані." }, { status: 503 });

  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= LIMIT) {
    return Response.json({ error: "Забагато ілюстрацій за годину. Спробуйте пізніше." }, { status: 429 });
  }
  recent.push(now);
  hits.set(ip, recent);

  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Неправильний запит." }, { status: 400 });
  const { reference, ...req } = parsed.data;

  try {
    const image = await drawIllustration(req, reference);
    return Response.json(image);
  } catch (err) {
    console.error("Illustration failed:", err);
    if (/RESOURCE_EXHAUSTED|\b429\b|quota/i.test(String(err))) {
      return Response.json(
        { error: "Ліміт генератора ілюстрацій вичерпано. Спробуйте пізніше — або власнику сайту треба увімкнути оплату в Google AI Studio." },
        { status: 429 },
      );
    }
    return Response.json({ error: "Не вдалося намалювати ілюстрацію. Спробуйте ще раз." }, { status: 502 });
  }
}

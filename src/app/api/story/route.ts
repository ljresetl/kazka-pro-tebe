import { z } from "zod";
import { aiStory, hasAiCredentials } from "@/lib/ai-story";
import { makeTemplateStory } from "@/lib/make-story";
import type { Story } from "@/lib/types";

export const maxDuration = 120;

const RequestSchema = z.object({
  childName: z.string().trim().min(1).max(40),
  gender: z.enum(["boy", "girl"]),
  age: z.number().int().min(1).max(12),
  theme: z.enum(["space", "forest", "sea", "dino", "castle", "meadow"]),
  trait: z.string().trim().min(1).max(40),
  friend: z.string().trim().max(40).optional(),
  message: z.string().trim().max(200).optional(),
  wish: z.string().trim().max(400).optional(),
});

// Простий захист від зловживань: не більше 8 казок на годину з однієї адреси.
// Живе в пам'яті одного сервера; для великих навантажень замінити на Redis/KV.
const WINDOW_MS = 60 * 60 * 1000;
const LIMIT = 8;
const hits = new Map<string, number[]>();

function tooMany(ip: string) {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > LIMIT;
}

export async function POST(request: Request) {
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (tooMany(ip)) {
    return Response.json(
      { error: "Забагато казок за годину. Спробуйте трохи пізніше або відкрийте вже створені в «Мої казки»." },
      { status: 429 },
    );
  }

  const parsed = RequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return Response.json(
      { error: "Перевірте поля форми: ім'я, вік і тема обов'язкові." },
      { status: 400 },
    );
  }
  const req = parsed.data;

  // Випадковий шаблонний сюжет — запасний варіант, якщо ШІ недоступний.
  const story: Story = makeTemplateStory(req);

  if (hasAiCredentials()) {
    try {
      Object.assign(story, await aiStory(req), { source: "ai" });
    } catch (err) {
      console.error("AI story failed, using template:", err);
    }
  }

  return Response.json(story);
}

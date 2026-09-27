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
});

export async function POST(request: Request) {
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

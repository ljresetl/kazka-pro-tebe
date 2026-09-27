import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod";
import { getTheme } from "./themes";
import { SCENES, type StoryPage, type StoryRequest } from "./types";

const StorySchema = z.object({
  title: z.string(),
  dedication: z.string(),
  pages: z.array(
    z.object({
      text: z.string(),
      scene: z.enum(SCENES),
    }),
  ),
});

const SYSTEM = `Ти — українська дитяча письменниця. Пишеш короткі добрі казки, де головний герой — конкретна дитина.

Правила:
- Лише українська мова, жива й проста, без русизмів. Слова, зрозумілі дитині вказаного віку.
- Рівно 7 сторінок. На кожній 3–5 повних речень, з деталями, діалогами й звуками (для 2–4 років — речення коротші, для 6–8 — довші й із новими словами).
- Правильний рід дієслів і займенників відповідно до статі дитини.
- Ім'я дитини використовуй у називному відмінку або в кличному, як природно звучить.
- Сюжет: дитина вирушає в пригоду, зустрічає помічника, розв'язує проблему завдяки вказаній рисі характеру, повертається додому. Без насильства, страшних сцен і моралізаторства в лоб.
- Для кожної сторінки обери сцену-ілюстрацію з дозволеного списку, яка найкраще пасує до тексту.
- Назва — коротка, з іменем дитини. Присвята — одне тепле речення, звернене до дитини; якщо батьки дали своє звернення, використай його дослівно.`;

export function hasAiCredentials(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
}

export async function aiStory(req: StoryRequest): Promise<{
  title: string;
  dedication: string;
  pages: StoryPage[];
}> {
  const client = new Anthropic();
  const theme = getTheme(req.theme);

  const brief = [
    `Ім'я дитини: ${req.childName}`,
    `Стать: ${req.gender === "boy" ? "хлопчик" : "дівчинка"}`,
    `Вік: ${req.age}`,
    `Тема: ${theme.label} — ${theme.blurb}`,
    `Риса характеру, яка допомагає в пригоді: ${req.trait}`,
    req.friend ? `Найкращий друг або улюбленець, який може з'явитися в казці: ${req.friend}` : null,
    req.message ? `Звернення батьків для присвяти: ${req.message}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.beta.messages.parse({
    model: "claude-opus-5",
    max_tokens: 16000,
    betas: ["server-side-fallback-2026-07-01"],
    fallbacks: "default",
    output_config: {
      effort: "medium",
      format: betaZodOutputFormat(StorySchema),
    },
    system: SYSTEM,
    messages: [{ role: "user", content: brief }],
  });

  if (response.stop_reason === "refusal") {
    throw new Error("Модель відмовилася писати цю казку");
  }
  const story = response.parsed_output;
  if (!story || story.pages.length === 0) {
    throw new Error("Не вдалося розібрати відповідь моделі");
  }
  return story;
}

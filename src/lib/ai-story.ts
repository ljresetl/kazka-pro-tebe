import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { betaZodOutputFormat } from "@anthropic-ai/sdk/helpers/beta/zod";
import { GoogleGenAI } from "@google/genai";
import { z } from "zod";
import { describeOptions } from "./story-options";
import { getTheme } from "./themes";
import { SCENES, type StoryPage, type StoryRequest } from "./types";

// Генерація казки через ШІ. Постачальник обирається змінною AI_PROVIDER:
//   "claude" — Anthropic Claude (ANTHROPIC_API_KEY);
//   "gemini" — Google Gemini (GEMINI_API_KEY; моделі — GEMINI_TEXT_MODEL).
// Якщо AI_PROVIDER не задано — береться той, для якого є ключ.

/** Сторінок історії; з обкладинкою й титулом — 14 сторінок книжки. */
export const STORY_PAGES = 12;

const StorySchema = z.object({
  title: z.string(),
  dedication: z.string(),
  pages: z
    .array(
      z.object({
        text: z.string(),
        scene: z.enum(SCENES),
        illustration: z.string(),
      }),
    )
    .length(STORY_PAGES),
});

type AiStory = { title: string; dedication: string; pages: StoryPage[] };

const SYSTEM = `Ти — українська дитяча письменниця. Пишеш добрі, цікаві казки, де головний герой — конкретна дитина.

Правила:
- Лише українська мова, жива й проста, без русизмів і канцеляриту. Слова, зрозумілі дитині вказаного віку.
- Рівно 12 сторінок (разом із обкладинкою й титулом книжка має 14 сторінок). На кожній сторінці ілюстрація займає ~70% аркуша, а текст — лише ~30%, тож пиши стисло: для 0–3 років — 2–3 короткі речення з повторами; для 4–8 років — 3–5 речень з деталями, діалогами й звуками (до 450 знаків); для 9 років і старших — 4–6 речень, живі діалоги, гумор і справжня інтрига (до 550 знаків).
- Будова: 1–2 — знайомство з дитиною та її світом; 3–4 — поклик до пригоди; 5–9 — пригода з двома-трьома перешкодами й помічником (кожна сторінка — нова подія, без повторів); 10–11 — розв'язка завдяки рисі характеру; 12 — повернення додому й тепла думка.
- Правильний рід дієслів і займенників відповідно до статі дитини. Ім'я — у називному відмінку, у звертаннях — у кличному.
- Сюжет: дитина вирушає в пригоду, зустрічає помічника, розв'язує проблему завдяки вказаній рисі характеру (або цінності, якої батьки хочуть навчити), повертається додому. Без насильства, страшних сцен і моралізаторства в лоб; остання сторінка закінчується теплою думкою про цю рису.
- Для кожної сторінки:
  • "scene" — сцена з дозволеного списку, що найкраще пасує до тексту;
  • "illustration" — опис ілюстрації АНГЛІЙСЬКОЮ (1–2 речення): хто й що робить, де, яка пора доби. Героя називай "the child", без імені, без опису зовнішності.
- Назва — коротка, з іменем дитини. Присвята — одне тепле речення до дитини; якщо батьки дали своє звернення, використай його дослівно.`;

function brief(req: StoryRequest) {
  const theme = getTheme(req.theme);
  const o = describeOptions(req);
  const others = (req.characters ?? [])
    .filter((c) => c.name.trim())
    .map((c) => {
      const kind = c.type === "pet" ? "тварина" : c.type === "object" ? "іграшка чи предмет" : "людина";
      const extra = [c.age ? `${c.age} р.` : null, c.hobbies ? `захоплення: ${c.hobbies}` : null, c.food ? `улюблена їжа: ${c.food}` : null]
        .filter(Boolean)
        .join(", ");
      return `  • ${c.name} (${[c.relation, kind].filter(Boolean).join(", ")}${extra ? "; " + extra : ""})`;
    });
  return [
    `Ім'я дитини: ${req.childName}`,
    `Стать: ${req.gender === "boy" ? "хлопчик" : "дівчинка"}`,
    `Вік: ${req.age}`,
    o.topic ? `Тема казки: ${o.category} — ${o.topic}` : `Тема: ${theme.label} — ${theme.blurb}`,
    o.moral ? `Мораль, цінність казки: ${o.moral}` : `Риса характеру, яка допомагає в пригоді: ${req.trait}`,
    req.hobbies ? `Захоплення дитини (вплети в сюжет): ${req.hobbies}` : null,
    req.food ? `Улюблена їжа дитини (можна згадати): ${req.food}` : null,
    others.length ? `Інші герої казки (усі мають з'явитися й діяти):\n${others.join("\n")}` : null,
    !others.length && req.friend ? `Найкращий друг або улюбленець, який може з'явитися в казці: ${req.friend}` : null,
    req.dedicationFrom ? `Казку дарує: ${req.dedicationFrom}${req.dedicationRelation ? ` (${req.dedicationRelation})` : ""}` : null,
    req.occasion ? `Привід: ${req.occasion}` : null,
    req.teach ? `Чого батьки хочуть навчити дитину цією казкою: ${req.teach}` : null,
    req.message ? `Звернення батьків для присвяти: ${req.message}` : null,
    req.wish
      ? `Побажання батьків до сюжету (побудуй казку навколо цього, якщо це безпечно й доречно для дитини; інакше м'яко обійди): ${req.wish}`
      : null,
  ]
    .filter(Boolean)
    .join("\n");
}

export type AiProvider = "claude" | "gemini";

export function aiProvider(): AiProvider | null {
  const hasClaude = Boolean(process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_AUTH_TOKEN);
  const hasGemini = Boolean(process.env.GEMINI_API_KEY);
  const wanted = process.env.AI_PROVIDER;
  if (wanted === "gemini" && hasGemini) return "gemini";
  if (wanted === "claude" && hasClaude) return "claude";
  if (hasClaude) return "claude";
  if (hasGemini) return "gemini";
  return null;
}

export function hasAiCredentials(): boolean {
  return aiProvider() !== null;
}

export async function aiStory(req: StoryRequest): Promise<AiStory> {
  const provider = aiProvider();
  if (provider === "gemini") return geminiStory(req);
  if (provider === "claude") return claudeStory(req);
  throw new Error("Немає ключа для ШІ");
}

function validate(story: AiStory | null | undefined): AiStory {
  if (!story || !Array.isArray(story.pages) || story.pages.length === 0) {
    throw new Error("Не вдалося розібрати відповідь моделі");
  }
  return story;
}

async function claudeStory(req: StoryRequest): Promise<AiStory> {
  const client = new Anthropic();
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
    messages: [{ role: "user", content: brief(req) }],
  });
  if (response.stop_reason === "refusal") {
    throw new Error("Модель відмовилася писати цю казку");
  }
  return validate(response.parsed_output);
}

async function geminiStory(req: StoryRequest): Promise<AiStory> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  // Безкоштовні моделі Gemini часто перевантажені (503) або впираються в ліміт (429).
  // Тоді пробуємо ще раз, а потім переходимо на запасну, легшу модель.
  const models = geminiTextModels();
  let lastError: unknown;
  for (const model of models) {
    for (let attempt = 0; attempt < 2; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: brief(req),
          config: {
            systemInstruction: SYSTEM,
            responseMimeType: "application/json",
            responseJsonSchema: z.toJSONSchema(StorySchema),
            temperature: 0.9,
          },
        });
        const raw = response.text;
        if (!raw) throw new Error("Gemini повернув порожню відповідь");
        const parsed = StorySchema.safeParse(JSON.parse(raw));
        if (!parsed.success) throw new Error("Gemini повернув казку в неправильному форматі");
        return validate(parsed.data);
      } catch (err) {
        lastError = err;
        console.error(`Gemini ${model}, спроба ${attempt + 1}:`, String(err).slice(0, 300));
        if (!isBusy(err)) break;
        await new Promise((r) => setTimeout(r, 1500));
      }
    }
  }
  throw lastError;
}

/** Основна модель (GEMINI_TEXT_MODEL) і запасні, через кому в GEMINI_FALLBACK_MODELS. */
export function geminiTextModels() {
  const main = process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest";
  const fallbacks = (process.env.GEMINI_FALLBACK_MODELS || "gemini-flash-lite-latest")
    .split(",")
    .map((m) => m.trim())
    .filter(Boolean);
  return [...new Set([main, ...fallbacks])];
}

function isBusy(err: unknown) {
  return /\b(503|429|500)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|overloaded|high demand/i.test(String(err));
}

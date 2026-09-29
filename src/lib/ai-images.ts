import "server-only";
import { GoogleGenAI, Modality } from "@google/genai";
import { findTopic, ILLUSTRATION_STYLES } from "./catalog";

// Ілюстрації до казки від Gemini (моделі «Nano Banana»).
// Якщо батьки дали згоду й завантажили фото, воно передається лише для обкладинки,
// щоб герой був схожий на дитину; інакше героя модель вигадує за статтю й віком.
// Щоб герой був однаковим на всіх сторінках, спершу малюється обкладинка,
// а далі вона передається як зразок для кожної сторінки.
//
// Змінні середовища: GEMINI_API_KEY, GEMINI_IMAGE_MODEL (за замовчуванням gemini-2.5-flash-image).

const STYLE =
  "Children's picture book illustration, Pixar-like 3D style: vibrant, bright, highly saturated colours, rich warm lighting with glossy highlights, friendly rounded characters with big expressive eyes and happy faces, detailed colourful background, cozy and joyful mood. Absolutely no text, letters, words or captions in the image.";

const HAIR_GIRL = [
  "long dark hair in two puffy pigtail buns",
  "shoulder-length light brown hair with a yellow hairband",
  "curly chestnut hair with a pink bow",
  "straight black hair with a fringe",
];
const HAIR_BOY = [
  "short messy light brown hair",
  "short curly dark hair",
  "straight blond hair with a fringe",
  "short ginger hair and freckles",
];
const OUTFIT = [
  "a coral pink top and blue trousers",
  "a yellow jumper and green shorts",
  "a mint green dress" /* лише для дівчаток */,
  "a sky blue t-shirt and red trousers",
];

/** Опис героя: однаковий для всіх сторінок однієї казки (залежить від seed). */
export function heroDescription(gender: "boy" | "girl", age: number, seed: number) {
  const hair = (gender === "girl" ? HAIR_GIRL : HAIR_BOY)[seed % 4];
  let outfit = OUTFIT[Math.floor(seed / 4) % OUTFIT.length];
  if (gender === "boy" && outfit.includes("dress")) outfit = OUTFIT[0];
  return `a ${age}-year-old ${gender === "girl" ? "girl" : "boy"} with ${hair}, wearing ${outfit}`;
}

export type GeneratedImage = { data: string; mimeType: string };

/** Як виглядає світ кожної пригоди — щоб усі картинки книжки були в одному місці. */
const THEME_SETTING: Record<string, string> = {
  space: "a magical night sky and outer space with colourful planets, twinkling stars and a gentle glowing whale",
  forest: "a sunny enchanted Ukrainian forest with tall oaks, mossy stumps, mushrooms and friendly forest animals",
  sea: "a bright seaside with a small sandy island, a palm tree, colourful scallop shells, dolphins and a little pink crab",
  dino: "a lush prehistoric valley with giant ferns, warm springs and friendly cartoon dinosaurs",
  castle: "a fairy-tale castle with red towers and little flags on a green hill, and a small shy green dragon",
  meadow: "a blooming Ukrainian meadow with poppies, cornflowers, daisies and busy cheerful bees",
};

export type IllustrationRequest = {
  gender: "boy" | "girl";
  age: number;
  heroSeed: number;
  theme: string;
  title: string;
  kind: "cover" | "page";
  /** Текст сторінки казки (українською). */
  pageText: string;
  /** Опис ілюстрації від ШІ-письменника (англійською), якщо є. */
  illustration?: string;
  /** Друг або улюбленець дитини, як його назвали батьки. */
  friend?: string;
  /** Стиль ілюстрацій з каталогу (id). */
  style?: string;
  /** Тема з каталогу (id) — визначає світ історії. */
  topic?: string;
  /** Інші герої: «песик Бублик», «братик Остап (3 роки)». */
  companions?: string[];
  /** Батьки завантажили фото дитини (передається разом із запитом). */
  hasPhoto?: boolean;
};

/** Точний запит до художника-ШІ, зібраний із налаштувань казки. */
export function buildPrompt(r: IllustrationRequest, { fromCover = false }: { fromCover?: boolean } = {}) {
  const hero = heroDescription(r.gender, r.age, r.heroSeed);
  const topic = r.topic ? findTopic(r.topic) : null;
  const setting = topic ? `${topic.topic.en} (${topic.category.en})` : (THEME_SETTING[r.theme] ?? THEME_SETTING.meadow);
  const style = ILLUSTRATION_STYLES.find((s) => s.id === r.style);
  const look = style
    ? `Children's picture book illustration. Art style: ${style.prompt}. Vibrant, bright, rich colours, expressive happy faces, friendly, cozy and joyful mood. Absolutely no text, letters, words or captions in the image.`
    : STYLE;
  const what =
    r.kind === "cover"
      ? `Cover picture for a children's fairy tale (its title, for context only — never write it: «${r.title}»). Show the main character happily in the world of the story.`
      : r.illustration
        ? `Illustrate this moment of the story: ${r.illustration}`
        : `Illustrate this page of a Ukrainian children's fairy tale (the text is in Ukrainian, draw exactly what happens in it): «${r.pageText}»`;
  return [
    look,
    // Сторінка з обкладинкою-зразком: зовнішність беремо ЛИШЕ з обкладинки. Текстовий опис героя
    // тут шкодив — художник то слухав його (інший колір волосся), то обкладинку.
    fromCover
      ? `Main character: exactly the same ${r.age}-year-old ${r.gender === "girl" ? "girl" : "boy"} as on the attached cover picture — identical face, hair colour, hairstyle, skin tone and clothes. Do not change any of these.`
      : r.hasPhoto
        ? `Main character: a ${r.age}-year-old ${r.gender === "girl" ? "girl" : "boy"} who looks like the child in the attached photo (same face, hair and skin tone), drawn in the art style above. The same character appears on every page of the book.`
        : `Main character: ${hero}. The same character appears on every page of the book.`,
    r.companions?.length ? `Other characters of the story: ${r.companions.join("; ")}. Draw them when they fit the moment.` : null,
    !r.companions?.length && r.friend ? `The child's best friend or pet "${r.friend}" accompanies them — draw it as a cute companion if it fits the moment.` : null,
    `World of the story: ${setting}.`,
    what,
    "Square 1:1 composition (the book page shows the picture above the text), the main character clearly visible, gentle and safe for children.",
    // Модель любить писати назву казки на машинах і вивісках — і з помилками. Назву сайт додає сам.
    "IMPORTANT: the picture must contain no text at all — no title, names, letters, words or numbers on vehicles, signs, books, banners or clothes.",
  ]
    .filter(Boolean)
    .join("\n");
}

/** Токени кожного запиту — у журнал Vercel, щоб рахувати собівартість казки (рядки «[usage]»). */
export function logUsage(what: string, model: string | undefined, usage: unknown) {
  console.log(`[usage] ${JSON.stringify({ what, model, usage })}`);
}

export function imagesConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

/**
 * Український текст сторінки художник-ШІ любить вписувати в картинку (ще й з помилками),
 * тож дешева текстова модель спершу описує сцену англійською. Якщо не вийшло — малюємо з тексту.
 */
async function describeScene(ai: GoogleGenAI, pageText: string): Promise<string | undefined> {
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest",
      contents: `One English sentence (max 35 words) describing the illustration for this page of a Ukrainian children's book: who does what, where, time of day, mood. Call the main hero "the child", never use names, never mention writing, signs, letters or words. Page: «${pageText}»`,
    });
    logUsage("scene", res.modelVersion, res.usageMetadata);
    return res.text?.trim().slice(0, 600) || undefined;
  } catch {
    return undefined;
  }
}

export async function drawIllustration(r: IllustrationRequest, reference?: GeneratedImage): Promise<GeneratedImage> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  if (r.kind === "page" && !r.illustration) r = { ...r, illustration: await describeScene(ai, r.pageText) };
  const fromCover = Boolean(reference) && !r.hasPhoto;
  const prompt =
    buildPrompt(r, { fromCover }) +
    (fromCover
      ? "\nUse the attached cover as the reference: keep the main character's face, hair colour, hairstyle and clothes and the art style exactly the same."
      : "");

  const response = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
    contents: [
      {
        role: "user",
        parts: [{ text: prompt }, ...(reference ? [{ inlineData: { mimeType: reference.mimeType, data: reference.data } }] : [])],
      },
    ],
    config: {
      responseModalities: [Modality.IMAGE],
      imageConfig: { aspectRatio: "1:1" },
    },
  });

  logUsage(r.kind, response.modelVersion, response.usageMetadata);
  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data)?.inlineData;
  if (!image?.data) throw new Error("Gemini не повернув зображення");
  return { data: image.data, mimeType: image.mimeType ?? "image/png" };
}

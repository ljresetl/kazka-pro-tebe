import "server-only";
import { GoogleGenAI, Modality } from "@google/genai";

// Ілюстрації до казки від Gemini (моделі «Nano Banana»).
// Фото дитини НЕ використовуються: героя модель вигадує за статтю й віком.
// Щоб герой був однаковим на всіх сторінках, спершу малюється обкладинка,
// а далі вона передається як зразок для кожної сторінки.
//
// Змінні середовища: GEMINI_API_KEY, GEMINI_IMAGE_MODEL (за замовчуванням gemini-2.5-flash-image).

const STYLE =
  "Children's picture book illustration in a soft modern style: warm pastel palette (sky blue, coral pink, sunny yellow, mint green), gentle paper texture, friendly rounded characters with simple dot eyes, clean composition, cozy and joyful mood. Absolutely no text, letters, words or captions in the image.";

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
};

/** Точний запит до художника-ШІ, зібраний із налаштувань казки. */
export function buildPrompt(r: IllustrationRequest) {
  const hero = heroDescription(r.gender, r.age, r.heroSeed);
  const setting = THEME_SETTING[r.theme] ?? THEME_SETTING.meadow;
  const what =
    r.kind === "cover"
      ? `Book cover illustration for the children's fairy tale "${r.title}". Show the main character happily in the world of the story.`
      : r.illustration
        ? `Illustrate this moment of the story: ${r.illustration}`
        : `Illustrate this page of a Ukrainian children's fairy tale (the text is in Ukrainian, draw exactly what happens in it): «${r.pageText}»`;
  return [
    STYLE,
    `Main character: ${hero}. The same character appears on every page of the book.`,
    r.friend ? `The child's best friend or pet "${r.friend}" accompanies them — draw it as a cute companion if it fits the moment.` : null,
    `World of the story: ${setting}.`,
    what,
    "Landscape 4:3 composition, the main character clearly visible, gentle and safe for children aged 2–8.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function imagesConfigured() {
  return Boolean(process.env.GEMINI_API_KEY);
}

export async function drawIllustration(r: IllustrationRequest, reference?: GeneratedImage): Promise<GeneratedImage> {
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  const prompt =
    buildPrompt(r) +
    (reference ? "\nUse the attached cover as the reference: keep the main character's face, hair and clothes and the art style exactly the same." : "");

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
      imageConfig: { aspectRatio: "4:3" },
    },
  });

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  const image = parts.find((p) => p.inlineData?.data)?.inlineData;
  if (!image?.data) throw new Error("Gemini не повернув зображення");
  return { data: image.data, mimeType: image.mimeType ?? "image/png" };
}

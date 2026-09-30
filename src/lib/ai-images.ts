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
  "Children's picture book illustration, Pixar-like 3D style: vibrant, bright, highly saturated colours, rich warm lighting with glossy highlights, friendly rounded characters with big expressive eyes and happy faces, detailed colourful background, cozy and joyful mood.";

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
  kind: "sheet" | "cover" | "page";
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
  /** «Паспорти» героїв казки: «Лоло: a small red crab with big eyes». */
  cast?: string[];
  /** Атмосфера всієї казки: пора доби, погода, місяць. */
  setting?: string;
  /** Точний опис героя з обкладинки. */
  heroLook?: string;
  /** Батьки завантажили фото дитини (передається разом із запитом). */
  hasPhoto?: boolean;
  /** Номер сторінки (0–11) — щоб чергувати плани кадру. */
  page?: number;
};

/** Різні плани кадру для сторінок, щоб ілюстрації не повторювали одна одну. */
const SHOTS = [
  "wide establishing shot showing the whole place, the child small in the scene",
  "medium shot from the side, the child in motion",
  "close-up on the child's face and hands showing emotion",
  "low angle looking up at the child and something big",
  "view from behind the child looking at what they discover",
  "bird's-eye view from above",
  "over-the-shoulder shot from behind the child",
  "dynamic diagonal composition, the child mid-action",
];

/** Хто на зразку A: фото дитини, лист персонажів, обкладинка (старі казки без листа). */
export type RefRole = "photo" | "sheet" | "cover";

/**
 * Точний запит до художника-ШІ за порадами Google (Nano Banana) і ілюстраторів дитячих книжок:
 * мета → стиль → ролі зразків → герої й предмети → світ і час → дія → композиція → якість.
 * Бажане описуємо позитивно (заборони модель інколи «бачить» і малює навпаки).
 */
export function buildPrompt(r: IllustrationRequest, { refA, prev = false }: { refA?: RefRole; prev?: boolean } = {}) {
  const who = r.gender === "girl" ? "girl" : "boy";
  const topic = r.topic ? findTopic(r.topic) : null;
  const world = topic ? `${topic.topic.en} (${topic.category.en})` : (THEME_SETTING[r.theme] ?? THEME_SETTING.meadow);
  const style = ILLUSTRATION_STYLES.find((s) => s.id === r.style);
  const styleText = style
    ? `${style.prompt}; vibrant, bright, rich colours, expressive happy faces, friendly, cozy and joyful mood`
    : STYLE;

  const intent =
    r.kind === "sheet"
      ? `Character reference sheet for a Ukrainian children's picture book (its title, for context only: «${r.title}»).`
      : r.kind === "cover"
        ? `Cover illustration for a Ukrainian children's picture book (its title, for context only: «${r.title}»). The title is added later by the book designer.`
        : `Illustration for page ${(r.page ?? 0) + 1} of 12 of a Ukrainian children's picture book.`;

  const refs = [
    refA === "photo"
      ? `Image A is a photo of the real child: draw the child as a ${r.age}-year-old ${who} with the same face, hair colour, hairstyle and skin tone, in the art style above, wearing an outfit that suits the story.`
      : null,
    refA === "sheet"
      ? "Image A is the character reference sheet of this book: every character and object looks exactly as on it — faces, hair, outfits with all their patterns and colours, species, sizes and colours."
      : null,
    refA === "cover" ? `Image A is the book cover: the main ${who} looks exactly as there — face, hair colour, hairstyle and the outfit with all its patterns and colours.` : null,
    prev
      ? "Image B is the previous page of the book: keep continuity with it — the same clothes, props, their colours and markings; keep its time of day and sky unless this moment names a later time."
      : null,
    r.kind !== "sheet" && (refA === "sheet" || refA === "cover" || prev)
      ? "Use the reference images for how things look; compose a brand-new scene for this moment with its own pose, camera angle and background."
      : null,
  ];

  const child =
    refA === "photo"
      ? null
      : refA
        ? r.heroLook
          ? `The child, named "the child": ${r.heroLook}. This outfit stays the same on every page, even if the scene mentions other clothes; only when the scene says the child puts something on (a coat, a raincoat, pyjamas at bedtime) is that item added.`
          : null
        : `The child, named "the child": ${heroDescription(r.gender, r.age, r.heroSeed)}.`;

  const what =
    r.kind === "sheet"
      ? "Layout on a plain white background, evenly lit: the child full-body in front view, side view and back view in the same outfit, plus a smiling face close-up; beside them each recurring character and object of the story, full-body and clearly separated, all shown side by side at their true size relative to the child, in the same art style, exactly as described with no extra patterns, emblems or decorations; a wordless model sheet made of pictures only."
      : r.kind === "cover"
        ? "The child happily in the world of the story with the main companions, a joyful inviting scene."
        : r.illustration
          ? `This moment of the story: ${r.illustration}`
          : `This page of a Ukrainian children's fairy tale (the text is in Ukrainian, draw exactly what happens in it): «${r.pageText}»`;

  return [
    intent,
    `Art style: ${styleText}.`,
    ...refs,
    child,
    r.cast?.length
      ? r.kind === "sheet"
        ? // Українські імена на листі модель підписує (ще й з помилками) — даємо лише опис.
          `Recurring characters and objects: ${r.cast.map((c) => c.split(":").slice(1).join(":").trim() || c).join("; ")}.`
        : `Recurring characters and objects, each always drawn identically (same species, count, colours, features, patterns and emblems — nothing added or removed — and the same size relative to the child): ${r.cast.join("; ")}.`
      : null,
    r.companions?.length ? `Other characters of the story: ${r.companions.join("; ")}; they appear when they fit the moment.` : null,
    !r.companions?.length && r.friend ? `The child's best friend or pet "${r.friend}" appears as a cute companion when it fits the moment.` : null,
    `World of the story: ${world}.`,
    r.setting && r.kind !== "sheet"
      ? `Time, weather and light of the whole story: ${r.setting}. Every picture keeps this sky, moon shape and colour palette, but the time of day named in this moment wins: daytime pictures have a sunny sky with no moon and no stars; the moon and stars appear only at twilight or night.`
      : null,
    what,
    r.cast?.length && r.kind !== "sheet"
      ? `Sizes relative to the child, kept in every shot: ${r.cast.map((c) => c.split(":")[0]).join(", ")} — exactly as sized in their descriptions above; small characters stay small even in the foreground or in close-ups.`
      : null,
    r.kind === "page" && r.page !== undefined ? `Camera: ${SHOTS[r.page % SHOTS.length]}. The child's pose and action fit this exact moment; when the child travels, the movement goes from left to right.` : null,
    r.kind !== "sheet"
      ? "Each recurring character and object appears at most once in a picture: no second boat, pet or look-alike in the background, and no extra creatures or faces on the sky, stars or objects that this moment does not mention."
      : null,
    "Square 1:1 composition with the main character clearly visible.",
    "Clean anatomy: every person has two eyes, one mouth and hands with five fingers; animals, toys and vehicles with faces have two eyes and one mouth.",
    // Модель любить писати назву казки на машинах і вивісках — і з помилками. Назву сайт додає сам.
    "Pure visual storytelling: all signs, books, banners, clothes and vehicles are blank or decorated only with simple shapes and pictures, without any letters or numbers.",
    "Gentle, safe and joyful for young children.",
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

/**
 * Опис героя з намальованої обкладинки (дешева текстова модель): волосся, одяг із візерунками, аксесуари.
 * Йде в запит кожної сторінки — так дрібні деталі (крабики на сукні) не губляться.
 */
async function describeHero(ai: GoogleGenAI, cover: GeneratedImage): Promise<string | undefined> {
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            { text: "Describe the main child character in this picture for an illustrator in one English sentence (max 45 words): hair colour and style, skin tone, every piece of clothing with its colours and patterns, shoes, accessories. No background, no names." },
            { inlineData: { mimeType: cover.mimeType, data: cover.data } },
          ],
        },
      ],
    });
    logUsage("hero", res.modelVersion, res.usageMetadata);
    return res.text?.trim().slice(0, 500) || undefined;
  } catch {
    return undefined;
  }
}

type Refs = { a?: GeneratedImage; aRole?: RefRole; b?: GeneratedImage };

async function paint(ai: GoogleGenAI, r: IllustrationRequest, refs: Refs, fix?: string): Promise<GeneratedImage> {
  const prompt = buildPrompt(r, { refA: refs.a ? refs.aRole : undefined, prev: Boolean(refs.b) }) + (fix ? `\nThis is a second attempt; correct these problems of the first one: ${fix}` : "");
  const images = [refs.a, refs.b].filter((x): x is GeneratedImage => Boolean(x));
  const response = await ai.models.generateContent({
    model: process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image",
    contents: [{ role: "user", parts: [{ text: prompt }, ...images.map((img) => ({ inlineData: { mimeType: img.mimeType, data: img.data } }))] }],
    config: { responseModalities: [Modality.IMAGE], imageConfig: { aspectRatio: "1:1" } },
  });
  logUsage(fix ? `${r.kind}-redraw` : r.kind, response.modelVersion, response.usageMetadata);
  const image = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
  if (!image?.data) throw new Error("Gemini не повернув зображення");
  return compact({ data: image.data, mimeType: image.mimeType ?? "image/png" });
}

/**
 * Перевірка готової сторінки дешевою моделлю (~0,05 Kč): зайві очі чи пальці, написи, не та пора доби,
 * інший одяг героя, зниклий або підмінений герой чи предмет. Повертає опис проблем або нічого.
 */
async function review(ai: GoogleGenAI, img: GeneratedImage, r: IllustrationRequest): Promise<string | undefined> {
  const expected = [
    r.kind === "page" && r.illustration ? `Scene: ${r.illustration}` : null,
    r.setting ? `Time and light of the story: ${r.setting}` : null,
    r.heroLook ? `Main child: ${r.heroLook}` : null,
    r.cast?.length ? `Recurring characters/objects: ${r.cast.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: `You check an illustration for a children's picture book page.\n${expected}\nReport only SERIOUS problems that a parent would notice at a glance: a person, animal, toy or vehicle with more or fewer than two eyes; extra or missing limbs or fingers; any letters or numbers; a clearly wrong time of day; the main child's hair colour, hairstyle or main outfit (garment type or main colour) different from the description; a recurring character or object from the scene that is missing, replaced by a different one, has clearly wrong colours or a clearly wrong size relative to the child. Ignore small decorations, patterns, embroidery and tiny accessories. Answer JSON {"ok": true} or {"ok": false, "problems": "short English description"}.`,
            },
            { inlineData: { mimeType: img.mimeType, data: img.data } },
          ],
        },
      ],
      config: { responseMimeType: "application/json" },
    });
    logUsage("review", res.modelVersion, res.usageMetadata);
    const v = JSON.parse(res.text ?? "{}") as { ok?: boolean; problems?: string };
    return v.ok === false && v.problems ? String(v.problems).slice(0, 400) : undefined;
  } catch {
    return undefined;
  }
}

/**
 * Малює лист персонажів, обкладинку чи сторінку. Зразок A — лист персонажів (або фото/обкладинка),
 * зразок B — попередня сторінка (одяг, предмети, світло переходять далі). Сторінку й обкладинку
 * перевіряє дешева модель; якщо є явні помилки — один раз перемальовуємо з підказкою, що виправити.
 */
export async function drawIllustration(
  r: IllustrationRequest,
  refs: Refs = {},
): Promise<GeneratedImage & { heroLook?: string }> {
  // Лише для локальної перевірки без витрат: MOCK_IMAGES=1 — кольоровий квадрат замість ШІ.
  if (process.env.MOCK_IMAGES === "1" && process.env.NODE_ENV !== "production") return mockImage(r);
  const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
  if (r.kind === "page" && !r.illustration) r = { ...r, illustration: await describeScene(ai, r.pageText) };

  let result = await paint(ai, r, refs);
  if (r.kind !== "sheet") {
    const problems = await review(ai, result, r);
    if (problems) {
      console.log(`[review] ${r.kind} ${r.page ?? ""}: ${problems}`);
      result = await paint(ai, r, refs, problems).catch(() => result);
    }
  }
  // Опис героя — з листа персонажів (або з обкладинки старих казок), для всіх наступних сторінок.
  const describe = r.kind === "sheet" || (r.kind === "cover" && refs.aRole !== "sheet");
  return describe ? { ...result, heroLook: await describeHero(ai, result) } : result;
}

/**
 * PNG від Gemini важить 2–3 МБ: на мобільному інтернеті такі відповіді обриваються, а як зразок
 * героя (його надсилають з кожною сторінкою) не вміщуються в запит. WebP 1024 px — ~200 КБ.
 */
async function compact(img: GeneratedImage): Promise<GeneratedImage> {
  try {
    const sharp = (await import("sharp")).default;
    const out = await sharp(Buffer.from(img.data, "base64"))
      .resize(1024, 1024, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 84 })
      .toBuffer();
    return { data: out.toString("base64"), mimeType: "image/webp" };
  } catch {
    return img;
  }
}

async function mockImage(r: IllustrationRequest): Promise<GeneratedImage> {
  const sharp = (await import("sharp")).default;
  const hue = r.kind === "cover" ? 20 : ((r.page ?? 0) * 37) % 360;
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024"><rect width="100%" height="100%" fill="hsl(${hue},70%,60%)"/><circle cx="512" cy="512" r="300" fill="white" opacity=".5"/></svg>`;
  // Шум — щоб розмір був як у справжньої картинки (~2 МБ PNG).
  const noise = await sharp({ create: { width: 1024, height: 1024, channels: 3, background: "#808080", noise: { type: "gaussian", mean: 128, sigma: 40 } } }).png().toBuffer();
  const png = await sharp(noise).composite([{ input: Buffer.from(svg), blend: "overlay" }]).png().toBuffer();
  await new Promise((res) => setTimeout(res, 800));
  return compact({ data: png.toString("base64"), mimeType: "image/png" });
}

const COLORING_PROMPT =
  "Turn this children's book illustration into a clean coloring page for a 3–6 year old: the same scene, characters and composition, drawn only with clean, smooth, closed black outlines of even medium thickness on a pure white background. No shading, no grey, no gradients, no hatching, no colour, no textures, no text. Simplify tiny details into larger areas that are easy to colour.";

/**
 * Розмальовка з готової ілюстрації: ШІ перемальовує сцену чистими контурами (дешевша модель —
 * кольори тут не потрібні), а потім лінії робимо чорними й товщими, щоб добре друкувались.
 */
export async function drawColoring(image: GeneratedImage): Promise<GeneratedImage> {
  let raw: Buffer;
  if (process.env.MOCK_IMAGES === "1" && process.env.NODE_ENV !== "production") {
    raw = Buffer.from(image.data, "base64");
  } else {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_COLORING_MODEL || "gemini-2.5-flash-image",
      contents: [{ role: "user", parts: [{ text: COLORING_PROMPT }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }],
      config: { responseModalities: [Modality.IMAGE], imageConfig: { aspectRatio: "1:1" } },
    });
    logUsage("coloring", response.modelVersion, response.usageMetadata);
    const out = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
    if (!out?.data) throw new Error("Gemini не повернув розмальовку");
    raw = Buffer.from(out.data, "base64");
  }
  return boldLines(raw);
}

/** Сірі тонкі лінії → чорні, трохи товщі; усе інше — чисто біле. */
async function boldLines(input: Buffer): Promise<GeneratedImage> {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(input).resize(1024, 1024, { fit: "inside" }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const out = Buffer.alloc(w * h, 255);
  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      let dark = false;
      for (let dy = -1; dy <= 1 && !dark; dy++) for (let dx = -1; dx <= 1; dx++) if (data[(y + dy) * w + x + dx] < 200) { dark = true; break; }
      if (dark) out[y * w + x] = 0;
    }
  }
  const png = await sharp(out, { raw: { width: w, height: h, channels: 1 } }).png({ compressionLevel: 9 }).toBuffer();
  return { data: png.toString("base64"), mimeType: "image/png" };
}

import "server-only";
import { z } from "zod";
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
  "Children's picture book illustration, Pixar-like 3D style: vibrant, bright, highly saturated colours, rich warm lighting with glossy highlights, friendly rounded characters with big expressive eyes and faces that show each moment's feeling, detailed colourful background, cozy and joyful mood.";

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
// Лише місця, без істот: тварини з опису світу з'являлися на сторінках зайвими героями.
const THEME_SETTING: Record<string, string> = {
  space: "a magical night sky and outer space with colourful planets and twinkling stars",
  forest: "a sunny enchanted Ukrainian forest with tall oaks, mossy stumps and mushrooms",
  sea: "a bright seaside with a small sandy island, a palm tree and colourful scallop shells",
  dino: "a lush prehistoric valley with giant ferns and warm springs",
  castle: "a fairy-tale castle with red towers and little flags on a green hill",
  meadow: "a blooming Ukrainian meadow with poppies, cornflowers and daisies",
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
  /** Одяг дитини на всю казку від ШІ-автора — для листа персонажів. */
  outfit?: string;
  /** Верхній одяг лише надворі в холод. */
  outerwear?: string;
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
    ? `${style.prompt}; vibrant, bright, rich colours, expressive faces that show each moment's feeling, friendly and cozy overall mood`
    : STYLE;

  const intent =
    r.kind === "sheet"
      ? `Character reference sheet for a Ukrainian children's picture book (its title, for context only: «${r.title}»).`
      : r.kind === "cover"
        ? `Cover illustration for a Ukrainian children's picture book (its title, for context only: «${r.title}»). The title is added later by the book designer.`
        : `Illustration for page ${(r.page ?? 0) + 1} of 12 of a Ukrainian children's picture book.`;

  const refs = [
    refA === "photo"
      ? `Image A is a photo of the real child: draw the child as a ${r.age}-year-old ${who} with the same face, hair colour, hairstyle and skin tone, in the art style above${r.outfit ? "." : ", wearing an outfit that suits the story."}`
      : null,
    refA === "sheet"
      ? "Image A is the character reference sheet of this book: every character and object looks exactly as on it — faces, hair, outfits with all their patterns and colours, species, sizes and colours."
      : null,
    refA === "cover" ? `Image A is the book cover: the main ${who} looks exactly as there — face, hair colour, hairstyle and the outfit with all its patterns and colours.` : null,
    prev
      ? "Image B is the previous page of the book: use it only for how things look — the same clothes, colours and markings — and keep its time of day and sky unless this moment names a later time. Who and what is in this picture comes only from this moment's list below: characters and objects of image B or of the reference sheet that are not listed stay out of this picture."
      : null,
    r.kind !== "sheet" && (refA === "sheet" || refA === "cover" || prev)
      ? "Use the reference images for how things look; compose a brand-new scene for this moment with its own pose, camera angle and background."
      : null,
  ];

  const child =
    refA === "photo"
      ? r.outfit
        ? `The child wears this outfit for the whole book: ${r.outfit}.`
        : null
      : refA
        ? r.heroLook
          ? `The child, named "the child": ${r.heroLook}. This outfit stays the same on every page, even if the scene mentions other clothes; ${r.outerwear ? "outerwear follows the rule below; " : ""}only when the scene says the child puts something on (a raincoat, pyjamas at bedtime${r.outerwear ? "" : ", a coat"}) is that item added.`
          : null
        : r.outfit
          ? `The child, named "the child": ${heroDescription(r.gender, r.age, r.heroSeed).replace(/, wearing .*$/, "").replace(/ with an? (yellow hairband|pink bow)$/, "")}, wearing ${r.outfit} — this outfit for the whole book.`
          : `The child, named "the child": ${heroDescription(r.gender, r.age, r.heroSeed)}.`;

  // Куртка й шапка — лише надворі в холод; удома, як у житті, без них.
  const outer = r.outerwear
    ? r.kind === "sheet"
      ? `Outerwear for the cold outdoors: ${r.outerwear}.`
      : `Outdoors in the cold the child also wears the outerwear from the reference sheet (${r.outerwear}) over the outfit; in warm places indoors — at home, in heated rooms — without it; in cold unheated places (a snowy barn, an old mill in winter) it stays on.`
    : null;

  const what =
    r.kind === "sheet"
      ? `Layout on a plain white background, evenly lit, in exactly two rows: top row — the child full-body in front view, side view and back view in the same outfit, plus a smiling face close-up${r.outerwear ? ", plus one more full-body front view of the child wearing the outerwear over the outfit" : ""}; bottom row — each recurring character and object of the story exactly once, left to right in the listed order, with no numbers or labels; the child appears only in the top row; empty white space is fine; full-body and clearly separated, all shown side by side at their true size relative to the child, in the same art style, exactly as described with no extra patterns, emblems or decorations; a wordless model sheet made of pictures only.`
      : r.kind === "cover"
        ? "The child happily in the world of the story with the main companions, a joyful inviting scene; every character appears exactly once — one of each, no second dog, robot or look-alike, nobody holds a small copy of another character."
        : r.illustration
          ? `This moment of the story (a storyboard note: draw exactly who and what is listed under "In the picture" — nobody and nothing else — doing exactly the "Action", with faces showing the "Feeling"):
${r.illustration}`
          : `This page of a Ukrainian children's fairy tale (the text is in Ukrainian, draw exactly what happens in it): «${r.pageText}»`;

  return [
    intent,
    `Art style: ${styleText.replace(/\.+$/, "")}.`,
    ...refs,
    child,
    outer,
    r.cast?.length
      ? r.kind === "sheet"
        ? // Українські імена на листі модель підписує (ще й з помилками) — даємо лише опис.
          `Exactly ${r.cast.length} recurring characters and objects, each drawn once, nothing else (a person whose description has outdoor clothes gets a second small view in them, side by side): ${r.cast.map((c) => c.split(":").slice(1).join(":").trim() || c).join(" | ")}.`
        : `Recurring characters and objects, each always drawn identically (same species, count, colours, features, patterns and emblems — nothing added or removed — and the same size relative to the child): ${r.cast.join("; ")}.`
      : null,
    // Є паспорти від автора — герої батьків уже там латиницею; кирилиця з конструктора художник вписував підписами.
    !r.cast?.length && r.companions?.length ? `Other characters of the story: ${r.companions.join("; ")}; they appear when they fit the moment.` : null,
    !r.cast?.length && !r.companions?.length && r.friend ? `The child's best friend or pet "${r.friend}" appears as a cute companion when it fits the moment.` : null,
    `World of the story: ${world}.`,
    r.setting && r.kind !== "sheet"
      ? `Time, weather and light of the whole story: ${r.setting.replace(/\.+$/, "")}. Every picture keeps this sky, moon shape and colour palette, but the time of day named in this moment wins: daytime pictures have a sunny sky with no moon and no stars; the moon and stars appear only at twilight or night.`
      : null,
    what,
    r.cast?.length && r.kind !== "sheet"
      ? `Sizes relative to the child, kept in every shot: ${r.cast.map((c) => c.split(":")[0]).join(", ")} — exactly as sized in their descriptions above; small characters stay small even in the foreground or in close-ups.`
      : null,
    r.kind === "page" && r.page !== undefined ? `${/Place and shot:/i.test(r.illustration ?? "") ? "Camera: as in the storyboard note." : `Camera: ${SHOTS[r.page % SHOTS.length]}.`} The child's pose and action fit this exact moment; when the child travels, the movement goes from left to right.` : null,
    r.kind !== "sheet"
      ? "Each recurring character and object appears at most once in a picture — no second copy or look-alike in the background — and no extra creatures that this moment does not mention. Furniture, lamps, night-lights, stars, the sky and other objects are plain, without faces, unless they are listed characters. Stars in the sky are small distant points of light, clearly different from any star-shaped object of the story."
      : null,
    r.kind === "cover"
      ? "Portrait 3:4 composition filling the whole picture edge to edge: the top quarter is a calm, simple area (sky or soft background) where the book title will be placed; the characters stand in the middle and lower part, clearly visible."
      : "Square 1:1 composition with the main character clearly visible.",
    // Будова окремо для кожного героя: загальне «дві руки» художник переносив і на тварин.
    anatomy(r),
    // Модель любить писати назву казки на машинах і вивісках — і з помилками. Назву сайт додає сам.
    "Pure visual storytelling: all signs, books, banners, clothes and vehicles are blank or decorated only with simple shapes and pictures, without any letters or numbers.",
    "Gentle, safe and joyful for young children.",
    // Ті самі пункти, що перевіряє автоперевірка (review): художник одразу малює правильно, а не після перемальовування.
    r.kind === "sheet"
      ? "Before finishing, check yourself: every listed character and object is drawn exactly once (the child only in the top row); no letters, numbers or labels anywhere; every body matches its exact anatomy."
      : [
          "Before finishing, check yourself against this list and fix anything that does not match:",
          "- every character and object listed for this picture is present, each exactly once; nobody and nothing else (no extra animals, no second copy, no faces on objects or the sky);",
          "- each character is exactly where the scene says (on the pier or in the boat, inside or outside, in front or behind) and does exactly the action of the scene;",
          "- every person has exactly two arms and two hands with five fingers; animals and toys match their anatomy; each hand holds at most one object; nothing floats in the air;",
          "- the child has the same face, skin tone, hair and clothes as on the reference sheet; relatives look like the child as described; everyone keeps their colours, markings and size;",
          "- the time of day, sky and light match this moment; the same place looks the same as on the previous page;",
          "- the faces show the feeling of the moment, eyes look in the same natural direction, faces are symmetric; there are no letters, numbers, words, logos or watermarks anywhere;",
          "- light comes from one clear source and every shadow falls away from it; nothing glows without a reason; the horizon is level;",
          "- clear depth: foreground, middle and background; everyday objects have a believable size next to people (a cup fits a hand, a door is taller than an adult); walls, windows, boats and furniture are straight and whole, nothing melts or merges into something else;",
          "- pairs match: two shoes of the same pair, two eyes of the same colour, both sleeves the same;",
          "- the main characters are not cut by the picture edge or at the joints (neck, wrists, knees) and keep a little space around them; the picture is not overcrowded — one clear focal point (the main character's face or the key action) reads at a glance, the hero stands out from the background by light and contrast, and gazes and gestures lead the eye into the picture;",
          "- every colour, pattern and part belongs to the right thing (the red sail is on the boat, not on the parrot); left, right, on, under, behind and inside are exactly as the scene says; when the scene has a cause and effect (a wave pushes the boat back), the effect is visible;",
          "- a fresh scene with its own poses — not a copy of the reference sheet's standing line-up; the art style, line and colour palette are the same as on the other pages of the book;",
          "- the main child's face is clearly visible and recognisable (not hidden behind objects or turned fully away unless the shot is from behind); small details stay consistent too — buttons, zippers, glasses, hair clips, patterns; teeth are even and few, pupils round, both eyes look the same way;",
          "- a limited harmonious palette of about 5–8 main colours shared with the whole book; warm light for safe and happy moments, cooler light for sad or scary ones;",
          `- every object and creature is easy for a ${r.age}-year-old to recognise — nothing abstract or ambiguous; ${r.age <= 3 ? "a simple, uncluttered background with few objects" : r.age <= 6 ? "a rich but clear background" : "a detailed background is fine as long as the action stays clear"};`,
          "- everything is safe and gentle for a young child: no weapons, blood, scary monsters or dangerous acts; a child near deep water or heights has an adult or safety gear nearby when the story allows; all characters, objects and brands are original — no known cartoon characters or logos.",
        ].join("\n"),
  ]
    .filter(Boolean)
    .join("\n");
}

/** Будова тіла з числами для кожного героя з паспорта; без паспортів — загальне правило. */
function anatomy(r: IllustrationRequest) {
  const bodies = (r.cast ?? [])
    .filter((c) => c.includes(" Body: "))
    .map((c) => `${c.split(":")[0]} — ${c.split(" Body: ")[1].trim().replace(/\.+$/, "")}`);
  if (!bodies.length) {
    return "Clean anatomy: every person has two eyes, one mouth and hands with five fingers; animals, toys and vehicles with faces have two eyes and one mouth. Each hand holds at most one object.";
  }
  return `Exact anatomy, counted, for each character separately: the child — two arms, two legs, five fingers on each hand, two eyes, one mouth; ${bodies.join("; ")}; any other person — two arms, two legs, five fingers on each hand. Each hand holds at most one object, and objects rest on something or are held — nothing floats.`;
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
      // Той самий формат розкадровки, що пише ШІ-автор, — для шаблонних казок.
      contents: `Storyboard note in English for the illustration of this page of a Ukrainian children's book, exactly 5 short lines:\nTime: time of day and sky as the text implies (daytime has no moon)\nIn the picture: everyone and every important object in the frame, with position and size relative to the child — only what the text needs\nAction: the main event of this page exactly as the text says (who does, gives, holds or hugs what)\nFeeling: the child's feeling as in the text\nPlace and shot: the place and a camera shot\nCall the main hero "the child", never use names, never mention writing, signs, letters or words; do not describe the child's clothes. Page: «${pageText}»`,
    });
    logUsage("scene", res.modelVersion, res.usageMetadata);
    return res.text?.trim().slice(0, 1200) || undefined;
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
            { text: "Describe the main child character in this picture (if several views, the first full-body front view) for an illustrator in one English sentence (max 45 words): hair colour and style, skin tone, every piece of clothing with its colours and patterns, shoes, accessories. No background, no names." },
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
    // Обкладинка — вертикальна, майже як аркуш A4: у друці вона на весь аркуш без полів.
    config: { responseModalities: [Modality.IMAGE], imageConfig: { aspectRatio: r.kind === "cover" ? "3:4" : "1:1" } },
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
const ReviewSchema = z.object({
  counts: z.array(z.object({ who: z.string(), count: z.number() })),
  hands: z.array(z.object({ who: z.string(), hands: z.number() })),
  text: z.boolean(),
  problems: z.string(),
});

/**
 * Автоматична перевірка КОЖНОГО малюнка (лист, обкладинка, сторінка) за загальними категоріями вад.
 * Модель мусить порахувати (скільки разів кожен герой, скільки рук, чи є букви/цифри), а рішення
 * «перемалювати» приймає код за цими числами — так нові вади тих самих типів ловляться самі,
 * без окремого правила під кожну.
 */
export async function review(
  ai: GoogleGenAI,
  img: GeneratedImage,
  r: IllustrationRequest,
  ref?: GeneratedImage,
  prev?: GeneratedImage,
): Promise<string | undefined> {
  const names = (r.cast ?? []).map((c) => c.split(":")[0].trim()).filter(Boolean);
  const expected = [
    r.kind === "page" && r.illustration ? `Scene: ${r.illustration}` : null,
    r.kind === "page" && r.pageText ? `Page text (Ukrainian): ${r.pageText}` : null,
    r.kind !== "sheet" && r.setting ? `Time and light of the story: ${r.setting}` : null,
    r.kind !== "sheet" && r.heroLook ? `Main child: ${r.heroLook}` : null,
    r.kind !== "sheet" && r.outerwear ? `Outdoors in the cold the child and other people may also wear their outerwear from the reference sheet (${r.outerwear}); indoors they wear it only if the scene says so.` : null,
    r.cast?.length ? `Recurring characters/objects: ${r.cast.join("; ")}` : null,
  ]
    .filter(Boolean)
    .join("\n");
  const task =
    r.kind === "sheet"
      ? "This is the character reference sheet: the child in several views in the top row (that is expected), and below it each recurring character and object exactly once (a person may also have one small view in outdoor clothes)."
      : r.kind === "cover"
        ? "This is the book cover: the child with the main companions, each character at most once."
        : "This is a page illustration.";
  const rules = [
    "Fill the JSON honestly by counting what you see:",
    `"counts" — for the main child and for each of these names, how many times it appears in the image: ${["the child", ...names].join(", ")}; also add an entry "other: <what>" for every creature or character that is not in this list.`,
    '"hands" — for every person: the number of visible hands (count carefully; a person holding three things may have a third hand).',
    '"text" — true if there are ANY letters, words, numbers, digits or labels anywhere in the image (runes and simple symbols that look like letters count too).',
    '"problems" — other SERIOUS problems a parent would notice at a glance, or "" if none: anatomy that does not match "Body:" (wrong number of legs, paws, wings, fingers, eyes; faces on objects that are not characters); a recurring character or object with clearly wrong colours, design or size relative to the child; the main child\'s skin tone, hair or main outfit different from the description (the skin tone must be the same on every page); a relative described as the child\'s twin, or with the child\'s skin tone, who does not match the child' +
      (ref ? " and from the reference sheet (same garments and colours; outdoor clothes only outdoors in the cold)" : "") +
      (r.kind === "page"
        ? '; impossible physics — one hand holding two or more objects, objects floating in the air, a liquid poured past the cup, things passing through each other; more copies of an object than the scene needs (two cups when one person drinks); light and shadows that contradict each other or glowing areas without a light source; objects that melt or merge into each other, broken walls, windows or furniture; everyday objects with an absurd size next to people; mismatched pairs (two different shoes, eyes of different colours); a main character cut by the picture edge or at the neck, wrists or knees; a colour or part on the wrong object (attribute mix-up); left/right, on/under, in front/behind different from the scene; the characters standing in a line copied from the reference sheet instead of acting in the scene; a different art style or colour palette than the reference sheet; the main child's face hidden or unrecognisable when the scene does not need it; small details that changed (buttons, glasses, hair clips, patterns); uneven or too many teeth, odd pupils; objects a young child cannot recognise; known cartoon characters, brands, logos or watermarks; anything scary or unsafe for a young child (weapons, blood, monsters, a child alone in danger); a character in a different place than the scene and the page text say (on the pier vs in the boat, in front of vs behind, inside vs outside — check where every listed character stands, sits or is); the main action of the scene not shown (who gives, holds, hugs or does what); the child\'s face showing a clearly different feeling than the scene; a character that the scene\'s "In the picture" list does not name, even one from the reference sheet; anything that clearly contradicts the page text (ignore small differences where the text allows both); a clearly wrong time of day'
        : "") +
      (prev ? "; the same place as the previous page but the same big objects there (a sundial, a clock, an arch, furniture) clearly redesigned" : "") +
      ". Ignore tiny decorations and embroidery.",
  ].join("\n");
  try {
    const res = await ai.models.generateContent({
      model: process.env.GEMINI_TEXT_MODEL || "gemini-flash-latest",
      contents: [
        {
          role: "user",
          parts: [
            // Лист персонажів поруч — щоб порівнювати одяг з картинкою, а не лише з текстовим описом.
            ...(ref && r.kind !== "sheet"
              ? [
                  { text: "Reference sheet of this book (how the child and every recurring character look on every page):" },
                  { inlineData: { mimeType: ref.mimeType, data: ref.data } },
                ]
              : []),
            // Попередня сторінка — щоб те саме місце й ті самі речі не змінювалися між сусідніми сторінками.
            ...(prev ? [{ text: "Previous page of the book (for continuity of places and objects):" }, { inlineData: { mimeType: prev.mimeType, data: prev.data } }] : []),
            { text: `You check an illustration for a children's picture book. ${task}\n${expected}\n${rules}\nImage to check:` },
            { inlineData: { mimeType: img.mimeType, data: img.data } },
          ],
        },
      ],
      config: { responseMimeType: "application/json", responseJsonSchema: z.toJSONSchema(ReviewSchema) },
    });
    logUsage("review", res.modelVersion, res.usageMetadata);
    const parsed = ReviewSchema.safeParse(JSON.parse(res.text ?? "{}"));
    if (!parsed.success) return undefined;
    const v = parsed.data;
    const found: string[] = [];
    // Рішення за підрахунком, а не за «ok» моделі: вона інколи рахує правильно, але все одно пише «все добре».
    if (v.text) found.push("there are letters, numbers or labels in the image — remove all of them, pictures only");
    const isChild = (w: string) => /^the child$/i.test(w.trim());
    const inPicture = (/^\s*In the picture:(.*)$/im.exec(r.illustration ?? "")?.[1] ?? "").toLowerCase();
    for (const c of v.counts) {
      const who = c.who.trim();
      if (/^other:/i.test(who)) {
        if (r.kind !== "sheet" && c.count > 0 && !/people|crowd|passer|villager|bird in the sky/i.test(who)) found.push(`an extra character that does not belong here: ${who.slice(6).trim()}`);
        continue;
      }
      if (isChild(who)) {
        if (r.kind !== "sheet" && c.count > 1) found.push("the main child appears more than once — draw the child exactly once");
        continue;
      }
      if (c.count > 1) found.push(`${who} appears ${c.count} times — draw it exactly once`);
      if (r.kind === "sheet" && c.count === 0) found.push(`${who} is missing from the sheet`);
      // Герой є в списку «In the picture» цієї сторінки, а на малюнку його немає.
      if (r.kind === "page" && c.count === 0 && inPicture.includes(who.toLowerCase())) found.push(`${who} is missing — the scene needs it`);
    }
    for (const h of v.hands) if (h.hands > 2) found.push(`${h.who} has ${h.hands} hands — every person has exactly two arms and two hands`);
    if (v.problems.trim()) found.push(v.problems.trim());
    return found.length ? found.join("; ").slice(0, 500) : undefined;
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
  // Перевіряємо все: лист персонажів, обкладинку й сторінки. Перемальований малюнок теж перевіряємо —
  // перемальовування інколи приносить нову ваду (другий папуга). Не більше двох спроб і в межах часу запиту.
  {
    const started = Date.now();
    const sheetRef = refs.aRole === "photo" ? undefined : refs.a;
    let problems = await review(ai, result, r, sheetRef, refs.b);
    for (let attempt = 1; problems && attempt <= 2; attempt++) {
      console.log(`[review] ${r.kind} ${r.page ?? ""} #${attempt}: ${problems}`);
      const next = await paint(ai, r, refs, problems).catch(() => undefined);
      if (!next) break;
      result = next;
      // Остання спроба або вже мало часу до ліміту функції — приймаємо як є.
      if (attempt === 2 || Date.now() - started > 60_000) break;
      problems = await review(ai, result, r, sheetRef, refs.b);
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
  "Turn this children's book illustration into a clean coloring page for a child: the same scene, the same characters with the same faces, hairstyles and clothes, and the same composition, drawn only with clean, smooth, fully closed black outlines on a pure white background, with nothing important near the page edges. Everything is outline only and white inside — dark hair (draw the curls or strands as outlines), dark clothes, shadows, water, rocks and night sky are NOT filled with black or grey. No shading, no grey, no gradients, no hatching, no solid black areas, no colour, no textures, no text. Simplify tiny details into larger areas that are easy to colour.";

/** Частка чорного на розмальовці: більше — значить, ШІ залив ділянки чорним, і розфарбувати їх не можна. */
const MAX_BLACK = 0.06;

/**
 * Розмальовка з готової ілюстрації: ШІ перемальовує сцену чистими контурами (дешевша модель —
 * кольори тут не потрібні), а потім лінії робимо чорними й товщими, щоб добре друкувались.
 */
/** Розмальовка за віком (практики видавців): товщина ліній, кількість дрібних деталей. */
function coloringByAge(age?: number) {
  if (age !== undefined && age <= 4) return { hint: " The child is a toddler: very thick bold outlines, only a few big simple shapes, no small details or background clutter, plenty of white space.", thick: 2 };
  if (age !== undefined && age <= 8) return { hint: " The child is 5–8: bold outlines, medium-sized shapes, a simple background with few small details.", thick: 1 };
  return { hint: " The child is 9 or older: clean medium outlines, more details are fine, but every area stays closed and large enough to colour.", thick: 1 };
}

export async function drawColoring(image: GeneratedImage, age?: number): Promise<GeneratedImage> {
  const byAge = coloringByAge(age);
  let raw: Buffer;
  if (process.env.MOCK_IMAGES === "1" && process.env.NODE_ENV !== "production") {
    raw = Buffer.from(image.data, "base64");
  } else {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    // Той самий формат, що й оригінал: вертикальна обкладинка лишається вертикальною.
    const meta = await (await import("sharp")).default(Buffer.from(image.data, "base64")).metadata().catch(() => null);
    const aspectRatio = meta?.width && meta.height && meta.height / meta.width > 1.15 ? "3:4" : "1:1";
    // Автоматична перевірка: якщо після обробки забагато чорного (заливки) — ще одна спроба з підказкою.
    let best: { img: GeneratedImage; black: number } | null = null;
    for (let attempt = 0; attempt < 2; attempt++) {
      const hint = byAge.hint + (attempt ? " The previous attempt had large solid black areas — this time draw absolutely everything as thin outlines with white inside." : "");
      const response = await ai.models.generateContent({
        model: process.env.GEMINI_COLORING_MODEL || "gemini-2.5-flash-image",
        contents: [{ role: "user", parts: [{ text: COLORING_PROMPT + hint }, { inlineData: { mimeType: image.mimeType, data: image.data } }] }],
        config: { responseModalities: [Modality.IMAGE], imageConfig: { aspectRatio } },
      });
      logUsage("coloring", response.modelVersion, response.usageMetadata);
      const out = response.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
      if (!out?.data) continue;
      const done = await boldLines(Buffer.from(out.data, "base64"), byAge.thick);
      if (!best || done.black < best.black) best = done;
      if (done.black <= MAX_BLACK) break;
      console.log(`[coloring] solid black areas: ${(done.black * 100).toFixed(0)}%`);
    }
    if (!best) throw new Error("Gemini не повернув розмальовку");
    return best.img;
  }
  return (await boldLines(raw, byAge.thick)).img;
}

/**
 * Розмальовка з картинки ШІ: усі лінії (навіть сірі) → чорні й трохи товщі; суцільні чорні заливки
 * (волосся, тіні, темне небо) → лише обвідка з білим усередині, щоб їх можна було розфарбувати.
 * "black" — частка заливок до чищення: багато — ШІ намалював не розмальовку, варто спробувати ще раз.
 */
export async function boldLines(input: Buffer, thick = 1): Promise<{ img: GeneratedImage; black: number }> {
  const sharp = (await import("sharp")).default;
  const { data, info } = await sharp(input).resize(1024, 1024, { fit: "inside" }).grayscale().raw().toBuffer({ resolveWithObject: true });
  const w = info.width;
  const h = info.height;
  const n = w * h;
  const ink = new Uint8Array(n);
  for (let i = 0; i < n; i++) ink[i] = data[i] < 200 ? 1 : 0;
  // Ерозія квадратом 9×9: лишаються лише товсті суцільні ділянки (лінії тонші — зникають).
  const R = 4;
  const rows = new Uint8Array(n);
  for (let y = 0; y < h; y++) {
    let run = 0;
    for (let x = 0; x < w; x++) {
      run = ink[y * w + x] ? run + 1 : 0;
      rows[y * w + x] = run >= 2 * R + 1 ? 1 : 0; // кінець горизонтального відрізка довжиною 9
    }
  }
  const solid = new Uint8Array(n);
  for (let x = 0; x < w; x++) {
    let run = 0;
    for (let y = 0; y < h; y++) {
      run = rows[y * w + x] ? run + 1 : 0;
      if (run >= 2 * R + 1) solid[(y - R) * w + (x - R)] = 1; // центр квадрата 9×9 повністю чорний
    }
  }
  let solidCount = 0;
  for (let i = 0; i < n; i++) if (solid[i]) solidCount++;
  // Розширюємо «серцевину» назад, лишаючи від заливки обвідку завтовшки ~3 px.
  const fill = new Uint8Array(n);
  const G = R - 3;
  for (let y = 0; y < h; y++)
    for (let x = 0; x < w; x++)
      if (solid[y * w + x])
        for (let dy = -G; dy <= G; dy++)
          for (let dx = -G; dx <= G; dx++) {
            const yy = y + dy;
            const xx = x + dx;
            if (yy >= 0 && yy < h && xx >= 0 && xx < w) fill[yy * w + xx] = 1;
          }
  const lines = new Uint8Array(n);
  for (let i = 0; i < n; i++) lines[i] = ink[i] && !fill[i] ? 1 : 0;
  // Потовщуємо лінії за віком (малечі — товщі), щоб добре друкувались і було легко розфарбовувати.
  const out = Buffer.alloc(n, 255);
  const t = Math.max(1, Math.min(3, thick));
  for (let y = t; y < h - t; y++)
    for (let x = t; x < w - t; x++) {
      let dark = false;
      for (let dy = -t; dy <= t && !dark; dy++) for (let dx = -t; dx <= t; dx++) if (lines[(y + dy) * w + x + dx]) { dark = true; break; }
      if (dark) out[y * w + x] = 0;
    }
  const png = await sharp(out, { raw: { width: w, height: h, channels: 1 } }).png({ compressionLevel: 9 }).toBuffer();
  return { img: { data: png.toString("base64"), mimeType: "image/png" }, black: solidCount / n };
}

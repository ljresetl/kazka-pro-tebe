// ТИМЧАСОВІ КАРТИНКИ З БІБЛІОТЕК.
// Зараз файли в public/img/ зібрані з 3D-іконок Microsoft Fluent Emoji (MIT) і шрифту Nunito (OFL)
// скриптом scripts/library-images/generate.py (джерела — на сторінці /litsenzii).
// Поле `prompt` кожного місця — готовий опис для генерації справжньої ілюстрації через ШІ
// (ChatGPT / gpt-image, Gemini тощо). Коли з'явиться можливість: згенеруйте за описом,
// збережіть як WebP під тим самим ім'ям (`file`) — і нова картинка замінить бібліотечну.
// Усі описи з кнопкою «Копіювати» — на службовій сторінці /zaglushky.
//
// Усі картинки сайту в одному місці. Поки картинки немає в public/img,
// замість неї показується заглушка з описом (prompt) для генерації.
// Як додати: згенеруйте картинку за описом, збережіть як WebP у шлях `file` —
// і вона з'явиться на сайті після наступної збірки.
import { AGE_GROUPS, CATEGORIES, ILLUSTRATION_STYLES, MORALS } from "./catalog";
import manifest from "./image-manifest.json";
import { NAMES } from "./pages/names-data";
import { AGES } from "./pages/age-list";
import { GIFTS } from "./pages/gifts";
import { EXTRAS } from "./offer";
import { FEATURES } from "./features-list";
import { EXAMPLE_PHOTO_SEEDS } from "./example-photos";

export type ImageSlot = {
  id: string;
  group: string;
  /** Що це за картинка — українською, для людини. */
  title: string;
  /** Опис для генератора картинок (англійською — так точніше). */
  prompt: string;
  width: number;
  height: number;
  /** Шлях у public/. */
  file: string;
};

// Стиль як на зразку (там іконки згенеровані в ChatGPT / gpt-image): м'який 3D «глина»,
// пастельні помаранчеві й шавлієві відтінки, прозорий фон. Генеруйте в ChatGPT з прозорим фоном (PNG → WebP).
const ICON_STYLE =
  "Cute 3D icon, soft matte clay render, rounded friendly shapes, warm pastel palette of orange, peach, sage green and wood tones, soft studio lighting, subtle shadow, centered, transparent background, square 1:1, no text, no letters.";

const icon = (group: string, id: string, title: string, subject: string): ImageSlot => ({
  id: `${group}/${id}`,
  group,
  title,
  prompt: `3D icon of ${subject}. ${ICON_STYLE}`,
  width: 512,
  height: 512,
  file: `/img/${group}/${id}.webp`,
});

const scene = (group: string, id: string, title: string, prompt: string, width = 1200, height = 900): ImageSlot => ({
  id: `${group}/${id}`,
  group,
  title,
  prompt,
  width,
  height,
  file: `/img/${group}/${id}.webp`,
});

const BOOK_LOOK =
  "Soft 3D render, warm cream background (#FFF8EE), gentle studio light and soft shadows, cheerful pastel colours with orange accents, no readable text or letters anywhere.";

export const SITE_IMAGES: ImageSlot[] = [
  scene(
    "home",
    "hero",
    "Головна: стос книжок праворуч від заголовка",
    `A playful stack of five colourful hardcover children's picture books, some standing and some lying at angles, one book open with illustrated pages. The covers show different illustrated adventures: a child astronaut with a whale in space, a child with a friendly dinosaur, a castle with a small dragon, a forest with an owl, a seaside with a singing seashell. Covers have only pictures, no titles. ${BOOK_LOOK}`,
  ),
  scene(
    "home",
    "krok-1",
    "Крок 1: розкажіть про героя",
    `A cute 3D scene: a parent's hand holding a smartphone, next to it a cheerful illustrated child character stepping out of the phone screen as a picture-book hero with a small cape, sparkles around. ${BOOK_LOOK}`,
    800,
    600,
  ),
  scene(
    "home",
    "krok-2",
    "Крок 2: оберіть історію і стиль",
    `A cute 3D scene: an open picture book with a small castle, a rocket and a tree popping out of its pages, surrounded by paint brushes and round colour swatches. ${BOOK_LOOK}`,
    800,
    600,
  ),
  scene(
    "home",
    "krok-3",
    "Крок 3: читайте й друкуйте",
    `A mother and a 5-year-old child reading a large illustrated hardcover picture book together on a cosy sofa under a warm lamp, a printed copy and a tablet with the same book next to them, Ukrainian embroidered cushion. Warm soft 3D animated film style, no readable text.`,
    800,
    600,
  ),
  scene(
    "home",
    "podarunok",
    "Банер свята: книжка-подарунок",
    `A hardcover children's picture book wrapped with an orange satin ribbon and a bow, a small greeting card and confetti around. ${BOOK_LOOK}`,
    800,
    600,
  ),
  scene(
    "book",
    "foto-pryklad",
    "Приклад: фото дитини → ілюстрація в книжці",
    `Split composition: on the left a simple printed photo of a smiling child in a yellow t-shirt pinned with a paper clip, a curved hand-drawn arrow in the middle, on the right the same child redrawn as a colourful storybook illustration hero in a magical forest. ${BOOK_LOOK}`,
    1000,
    600,
  ),
  scene(
    "book",
    "hardcover",
    "Друкована книжка у твердій обкладинці",
    `A large A4 hardcover children's picture book standing slightly open, showing a glossy illustrated cover with a child hero and a friendly dragon, next to it the same book lying open with a full-page illustration. Thick coated paper, rich colours. ${BOOK_LOOK}`,
    900,
    900,
  ),
];

export const AGE_IMAGES = AGE_GROUPS.map((a) => icon("vik", a.id, `Вік ${a.label}`, a.icon));
export const CATEGORY_IMAGES = CATEGORIES.map((c) => icon("rozdil", c.id, `Розділ «${c.label}»`, c.icon));
export const TOPIC_IMAGES = CATEGORIES.flatMap((c) =>
  c.topics.map((t) => icon("tema", t.id, `Тема «${t.label}» (${c.label})`, t.icon)),
);
// Картки віку (/vik): дитина відповідного віку з книжкою.
const AGE_LOOK: Record<number, string> = {
  0: "a tiny baby lying on a soft blanket looking at a big picture book",
  1: "a one-year-old toddler sitting and pointing at a colourful board book",
  2: "a two-year-old toddler turning pages of a thick picture book",
  3: "a three-year-old child in pyjamas hugging a picture book",
  4: "a four-year-old child in a superhero cape reading a picture book",
  5: "a five-year-old child pointing at letters in a book",
  6: "a six-year-old first-grader with a backpack reading a book",
  7: "a seven-year-old child reading a book in a treehouse",
  8: "an eight-year-old child reading an adventure book with a torch",
  9: "a nine-year-old child with headphones reading a comic-style book",
  10: "a ten-year-old child reading a thick fantasy book on a beanbag",
  11: "an eleven-year-old child reading a book on a skateboard ramp",
  12: "a twelve-year-old reading a book in a cosy window seat",
  13: "a thirteen-year-old teenager smiling at a personalised book",
  14: "a fourteen-year-old teenager reading a book with a phone aside",
  15: "a fifteen-year-old teenager holding a hardcover book with a proud smile",
};
export const AGE_PAGE_IMAGES = AGES.map((a) =>
  scene("vik-rik", a.slug, `Картка віку «${a.label}»`, `Cute 3D illustration: ${AGE_LOOK[a.years]}. ${BOOK_LOOK}`, 600, 600),
);

// «Використані фото» в прикладах: вигаданий портрет дитини, з якого намальовано героя.
export const EXAMPLE_PHOTO_IMAGES = EXAMPLE_PHOTO_SEEDS.map((e) =>
  scene(
    "pryklad-foto",
    e.slug,
    `Приклад «${e.name}»: фото дитини, з якого намальовано героя`,
    `Natural smartphone-style portrait photo of a smiling ${e.age}-year-old ${e.gender === "boy" ? "boy" : "girl"} outdoors in soft daylight, head and shoulders, plain casual clothes, fictional person, photorealistic, square.`,
    400,
    400,
  ),
);

// Можливості (/mozhlyvosti).
export const FEATURE_IMAGES = FEATURES.map((f) => scene("mozhlyvosti", f.id, `Можливість: ${f.title}`, `Cute 3D illustration: ${f.image}. ${BOOK_LOOK}`, 800, 600));

// Додатки до книжки (/tsiny).
const EXTRA_LOOK: Record<string, string> = {
  lystivka: "three folded greeting cards with colourful children's book illustrations on the front, different designs",
  rozmalovka: "an open colouring book with black-and-white outline illustrations of a child and a dragon, crayons beside it",
  polotno: "a canvas print on a wooden frame hanging above a child's bed showing a colourful storybook illustration",
  kalendar: "a wall calendar with colourful storybook illustrations, spiral bound, a birthday date circled",
};
export const EXTRA_IMAGES = EXTRAS.map((e) => scene("dodatky", e.id, `Додаток: ${e.name}`, `Cute 3D still life: ${EXTRA_LOOK[e.id]}. ${BOOK_LOOK}`, 800, 600));

// Картинки приводів для подарунків (/podarunky).
export const GIFT_IMAGES = GIFTS.map((g) => scene("pryvid", g.slug, `Подарунок: ${g.label}`, `Cute 3D still life: ${g.image}. ${BOOK_LOOK}`, 800, 600));

// Обкладинка книжки для сторінки імені (/imena/[slug]).
export const NAME_IMAGES = NAMES.map((n) => {
  const topic = CATEGORIES.flatMap((c) => c.topics).find((t) => t.id === n.topic)!;
  const kid = n.g === "m" ? "a cheerful 6-year-old boy" : "a cheerful 6-year-old girl";
  return scene(
    "imya",
    n.slug,
    `Обкладинка книжки для імені ${n.name} (тема «${topic.label}»)`,
    `Front cover of a hardcover children's picture book, standing at a slight angle: ${kid} as the hero of an adventure about ${topic.en}, ${topic.icon} next to the child. Big clear space at the top of the cover for a title, but no letters or text. ${BOOK_LOOK}`,
    800,
    800,
  );
});

// Великий 3D-персонаж угорі сторінки теми (як динозавр на сторінці «Динозаври»).
export const TOPIC_HERO_IMAGES = CATEGORIES.flatMap((c) =>
  c.topics.map((t) =>
    scene(
      "tema-velyka",
      t.id,
      `Сторінка теми «${t.label}»: великий персонаж праворуч від заголовка`,
      `Large cute 3D character illustration for a children's book page about ${t.en}: ${t.icon}, friendly smiling face, full body, dynamic cheerful pose. Soft clay 3D render, warm pastel colours with orange accents, soft studio lighting, isolated on a plain cream background (#FFF8EE), no text.`,
      900,
      900,
    ),
  ),
);
export const MORAL_IMAGES = MORALS.map((m) => icon("moral", m.id, `Мораль «${m.label}»`, m.icon));
export const STYLE_IMAGES = ILLUSTRATION_STYLES.map((s) =>
  scene(
    "styl",
    s.id,
    `Стиль «${s.label}» — приклад`,
    `Children's book illustration: ${s.sample}. Style: ${s.prompt}. Bright, friendly, 4:3 landscape, no text.`,
    800,
    600,
  ),
);

export const ALL_IMAGES: ImageSlot[] = [
  ...SITE_IMAGES,
  ...AGE_IMAGES,
  ...CATEGORY_IMAGES,
  ...MORAL_IMAGES,
  ...STYLE_IMAGES,
  ...TOPIC_IMAGES,
  ...TOPIC_HERO_IMAGES,
  ...NAME_IMAGES,
  ...AGE_PAGE_IMAGES,
  ...GIFT_IMAGES,
  ...EXTRA_IMAGES,
  ...FEATURE_IMAGES,
  ...EXAMPLE_PHOTO_IMAGES,
];

export const IMAGE_GROUPS: { id: string; label: string }[] = [
  { id: "home", label: "Головна сторінка" },
  { id: "book", label: "Книжка" },
  { id: "vik", label: "Вік (4)" },
  { id: "rozdil", label: "Розділи (8)" },
  { id: "moral", label: "Мораль (8)" },
  { id: "styl", label: "Стилі ілюстрацій (10)" },
  { id: "tema", label: `Теми (${TOPIC_IMAGES.length})` },
  { id: "pryklad-foto", label: "Фото для прикладів (10)" },
  { id: "mozhlyvosti", label: "Можливості (10)" },
  { id: "dodatky", label: "Додатки до книжки (4)" },
  { id: "pryvid", label: `Подарунки за приводом (${GIFT_IMAGES.length})` },
  { id: "vik-rik", label: `Картки віку (${AGE_PAGE_IMAGES.length})` },
  { id: "imya", label: `Обкладинки для сторінок імен (${NAME_IMAGES.length})` },
  { id: "tema-velyka", label: `Великі персонажі сторінок тем (${TOPIC_HERO_IMAGES.length})` },
];

const READY = new Set<string>(manifest as string[]);
const BY_ID = new Map(ALL_IMAGES.map((s) => [s.id, s]));

export function getSlot(id: string): ImageSlot {
  const slot = BY_ID.get(id);
  if (!slot) throw new Error(`Невідома картинка: ${id}`);
  return slot;
}

export function isReady(slot: ImageSlot) {
  return READY.has(slot.file);
}

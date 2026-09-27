// Усі картинки сайту в одному місці. Поки картинки немає в public/img,
// замість неї показується заглушка з описом (prompt) для генерації.
// Як додати: згенеруйте картинку за описом, збережіть як WebP у шлях `file` —
// і вона з'явиться на сайті після наступної збірки.
import { AGE_GROUPS, CATEGORIES, ILLUSTRATION_STYLES, MORALS } from "./catalog";
import manifest from "./image-manifest.json";

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

const ICON_STYLE =
  "Cute 3D icon, glossy soft clay render, rounded friendly shapes, warm pastel colours with orange accents, soft studio lighting, gentle shadow, centered, plain cream background (#FFF8EE), square 1:1, no text, no letters.";

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
];

export const AGE_IMAGES = AGE_GROUPS.map((a) => icon("vik", a.id, `Вік ${a.label}`, a.icon));
export const CATEGORY_IMAGES = CATEGORIES.map((c) => icon("rozdil", c.id, `Розділ «${c.label}»`, c.icon));
export const TOPIC_IMAGES = CATEGORIES.flatMap((c) =>
  c.topics.map((t) => icon("tema", t.id, `Тема «${t.label}» (${c.label})`, t.icon)),
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
];

export const IMAGE_GROUPS: { id: string; label: string }[] = [
  { id: "home", label: "Головна сторінка" },
  { id: "vik", label: "Вік (4)" },
  { id: "rozdil", label: "Розділи (8)" },
  { id: "moral", label: "Мораль (8)" },
  { id: "styl", label: "Стилі ілюстрацій (10)" },
  { id: "tema", label: `Теми (${TOPIC_IMAGES.length})` },
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

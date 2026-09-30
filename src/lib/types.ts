export const SCENES = [
  "home",
  "forest",
  "sea",
  "space",
  "dino",
  "castle",
  "night",
  "meadow",
] as const;

// Сюжетні ілюстрації — намальовані під конкретні події казок.
// ШІ їх не обирає (у запиті до моделі лише загальні сцени SCENES).
export const STORY_SCENES = [
  "sing-home",
  "crab-door",
  "boat-dolphins",
  "island-silent",
  "island-singing",
  "shell-gift",
] as const;

export type SceneId = (typeof SCENES)[number] | (typeof STORY_SCENES)[number];

export type Gender = "boy" | "girl";

export type ThemeId = "space" | "forest" | "sea" | "dino" | "castle" | "meadow";

/** Готова ілюстрація-картинка (лежить у public/illustrations). */
export type Illustration = {
  src: string;
  width: number;
  height: number;
};

/** Герой казки, що повторюється на сторінках: ім'я й точний вигляд англійською (для художника). */
export type CastMember = { name: string; look: string };

export type StoryPage = {
  text: string;
  scene: SceneId;
  /** Якщо є — показується замість намальованої сцени. */
  image?: Illustration;
  /** Опис ілюстрації англійською для генератора картинок (від ШІ). */
  illustration?: string;
};

export type Story = {
  id: string;
  title: string;
  dedication: string;
  childName: string;
  gender: Gender;
  age: number;
  theme: ThemeId;
  pages: StoryPage[];
  source: "ai" | "template" | "library";
  createdAt: number;
  /** Параметри, з якими створено казку, — для кнопки «Інший сюжет». */
  trait?: string;
  friend?: string;
  message?: string;
  wish?: string;
  /** Який шаблонний сюжет використано (для «Інший сюжет»). */
  plotId?: string;
  paid?: boolean;
  /** Нову казку сайт ілюструє одразу: "pending" — ще не почали, "started" — вже малювали (вдруге не запускаємо). */
  illustrate?: "pending" | "started";
  /** «Паспорти» героїв, що повторюються, — щоб художник малював їх однаково. */
  cast?: CastMember[];
  /** Атмосфера всієї казки для художника (пора доби, погода, місяць…). */
  setting?: string;
  /** Точний опис героя з намальованої обкладинки (одяг, візерунки) — для всіх сторінок. */
  heroLook?: string;
  /** Підпис сервера: без нього ілюстрації не малюються (src/lib/quota.ts). */
  ticket?: string;
  /** Підпис оплати від сервера: дозволяє домалювати й перемальовувати всю книжку. */
  paidTicket?: string;
  /** Номер замовлення, яким оплачено е-книгу (для знижки на друк). */
  paidOrder?: string;
  options?: BookOptions;
};

export type ProductId = "pdf" | "pdf-coloring" | "print";

export type Order = {
  id: string;
  /** Старі замовлення — одна казка й один товар. */
  storyId?: string;
  storyTitle?: string;
  product?: ProductId;
  /** Нові замовлення — позиції кошика. */
  items?: import("./cart").CartLine[];
  /** Код друга, якщо застосовано. */
  referral?: string;
  amount: number;
  contact: { name: string; email: string; phone: string };
  /** Лише для друкованої книжки. */
  delivery?: { city: string; branch: string };
  comment?: string;
  status: "pending" | "paid";
  createdAt: number;
};

/** Додатковий герой казки (друг, братик, улюбленець, іграшка). */
export type Character = {
  type: "person" | "pet" | "object";
  name: string;
  /** Хто це головному героєві: братик, песик, бабуся… */
  relation?: string;
  gender?: "girl" | "boy" | "neutral";
  age?: number;
  hobbies?: string;
  food?: string;
};

/** Вибір у конструкторі: розділ, тема, мораль, стиль, шрифт, передмова. */
export type BookOptions = {
  ageGroup?: string;
  category?: string;
  topic?: string;
  moral?: string;
  style?: string;
  font?: string;
  hobbies?: string;
  food?: string;
  characters?: Character[];
  dedicationFrom?: string;
  dedicationRelation?: string;
  occasion?: string;
  teach?: string;
};

export type StoryRequest = BookOptions & {
  childName: string;
  gender: Gender;
  age: number;
  theme: ThemeId;
  trait: string;
  friend?: string;
  /** Звернення від батьків на першій сторінці. */
  message?: string;
  /** Побажання батьків до сюжету (працює лише з ШІ). */
  wish?: string;
};

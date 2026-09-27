import longTexts from "./examples-texts.json";
import { PLOTS, templateStory, yearsWord } from "./template-story";
import { getTheme } from "./themes";
import type { Gender, Illustration, SceneId, StoryPage, ThemeId } from "./types";

// Приклади побудовані на тих самих сюжетах, що й казки покупців.
// Довші, «авторські» версії текстів лежать в examples-texts.json
// (написані локальною моделлю Лапа й вичитані вручну). Якщо для прикладу
// там немає тексту, береться шаблонна версія.

const LONG_TEXTS = longTexts as Record<string, string[]>;

type ExampleSeed = {
  slug: string;
  childName: string;
  gender: Gender;
  age: number;
  theme: ThemeId;
  plotId: string;
  trait: string;
  friend?: string;
  message: string;
  summary: string;
  /** Готові ілюстрації: обкладинка + по одній на сторінку. */
  images?: { cover: Illustration; pages: Illustration[] };
};

export type ExampleStory = ExampleSeed & {
  title: string;
  dedication: string;
  cover: SceneId;
  coverImage?: Illustration;
  pages: StoryPage[];
  ageLabel: string;
};

// На GitHub Pages сайт живе в підпапці (basePath), а next/image не додає її до src сам.
const img = (src: string, width: number, height: number): Illustration => ({
  src: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${src}`,
  width,
  height,
});

const SEEDS: ExampleSeed[] = [
  {
    slug: "mariyka-i-zoryanyi-kyt",
    childName: "Марійка",
    gender: "girl",
    age: 5,
    theme: "space",
    plotId: "space-kyt",
    trait: "сміливість",
    message: "Марійко, нехай кожна твоя ніч світиться добрими снами. Любимо тебе, мама й тато.",
    summary: "Марійка піднімається зоряною драбиною й допомагає киту знайти скриньку з добрими снами.",
  },
  {
    slug: "tymko-i-taiemnytsia-lisu",
    childName: "Тимко",
    gender: "boy",
    age: 6,
    theme: "forest",
    plotId: "forest-penok",
    trait: "кмітливість",
    friend: "песик Бублик",
    message: "Тимку, ти вмієш помічати те, чого не бачать інші. З днем народження!",
    summary: "Тимко з лупою розгадує знаки на старому пеньку й відчиняє лісову комору.",
  },
  {
    slug: "solomiia-i-mushlia",
    childName: "Соломія",
    gender: "girl",
    age: 4,
    theme: "sea",
    plotId: "sea-mushlia",
    trait: "доброта",
    message: "Соломійко, твоя пісенька робить світ теплішим. Обіймаємо, бабуся й дідусь.",
    summary: "Соломія пливе з крабиком на острів і повертає мушлям їхню пісню.",
    images: {
      cover: img("/illustrations/sea-mushlia/00-cover.webp", 338, 517),
      pages: [
        img("/illustrations/sea-mushlia/01.webp", 334, 517),
        img("/illustrations/sea-mushlia/02.webp", 336, 517),
        img("/illustrations/sea-mushlia/03.webp", 337, 517),
        img("/illustrations/sea-mushlia/04.webp", 451, 521),
        img("/illustrations/sea-mushlia/05.webp", 459, 521),
        img("/illustrations/sea-mushlia/06.webp", 454, 521),
      ],
    },
  },
  {
    slug: "danylko-i-dyplodok",
    childName: "Данилко",
    gender: "boy",
    age: 5,
    theme: "dino",
    plotId: "dino-dyplodok",
    trait: "терплячість",
    message: "Данилку, ти вмієш слухати серцем. Мама.",
    summary: "Данилко допомагає маленькому диплодоку знайти маму в долині динозаврів.",
  },
  {
    slug: "zlata-i-drakon",
    childName: "Злата",
    gender: "girl",
    age: 6,
    theme: "castle",
    plotId: "castle-drakon",
    trait: "доброта",
    message: "Злато, навіть найбільші інколи бояться. Дякуємо, що ти поруч.",
    summary: "Злата вчить маленького дракона не боятися темряви.",
  },
  {
    slug: "ostap-i-kvitkove-sviato",
    childName: "Остап",
    gender: "boy",
    age: 4,
    theme: "meadow",
    plotId: "meadow-khmarka",
    trait: "вміння дружити",
    message: "Остапчику, добре слово — найсильніше чарівне заклинання.",
    summary: "Остап рятує квіткове свято одним добрим словом для ображеної хмарки.",
  },
  {
    slug: "veronika-i-sumnyi-misyats",
    childName: "Вероніка",
    gender: "girl",
    age: 3,
    theme: "space",
    plotId: "space-misyats",
    trait: "допитливість",
    message: "Веронічко, твої «чому?» освітлюють світ. Солодких снів!",
    summary: "Вероніка летить на паперовому літачку, щоб розвеселити сумний Місяць.",
  },
  {
    slug: "maksym-i-mayak",
    childName: "Максим",
    gender: "boy",
    age: 7,
    theme: "sea",
    plotId: "sea-mayak",
    trait: "сміливість",
    message: "Максиме, ти той, хто запалює світло для інших. Пишаємося тобою!",
    summary: "Максим піднімається на маяк, щоб рибальський човник знайшов дорогу додому.",
  },
  {
    slug: "sofiyka-i-yaitse",
    childName: "Софійка",
    gender: "girl",
    age: 5,
    theme: "dino",
    plotId: "dino-yaitse",
    trait: "терплячість",
    friend: "кішка Мурка",
    message: "Софійко, найкращі речі ростуть повільно. Мама й тато.",
    summary: "Софійка зігріває знайдене яйце, з якого вилуплюється трицератопс.",
  },
  {
    slug: "andriiko-i-solovei",
    childName: "Андрійко",
    gender: "boy",
    age: 4,
    theme: "forest",
    plotId: "forest-solovei",
    trait: "вміння дружити",
    message: "Андрійку, хай твій ранок завжди починається з пісні.",
    summary: "Андрійко допомагає соловейку знайти загублену пісню.",
  },
];

function build(seed: ExampleSeed): ExampleStory {
  const variant = PLOTS[seed.theme].findIndex((p) => p.id === seed.plotId);
  const story = templateStory(
    {
      childName: seed.childName,
      gender: seed.gender,
      age: seed.age,
      theme: seed.theme,
      trait: seed.trait,
      friend: seed.friend,
      message: seed.message,
    },
    Math.max(variant, 0),
  );
  const long = LONG_TEXTS[seed.slug];
  const useLong = Array.isArray(long) && long.length === story.pages.length;
  const pages = story.pages.map((p, i) => ({
    ...p,
    text: useLong ? long[i] : p.text,
    image: seed.images?.pages[i],
  }));
  return {
    ...seed,
    title: story.title,
    dedication: story.dedication,
    cover: getTheme(seed.theme).scene,
    coverImage: seed.images?.cover,
    pages,
    ageLabel: yearsWord(seed.age),
  };
}

export const EXAMPLES: ExampleStory[] = SEEDS.map(build);

export function getExample(slug: string) {
  return EXAMPLES.find((e) => e.slug === slug);
}

/** Вікові групи для фільтра. */
export const AGE_GROUPS = [
  { id: "2-3", label: "2–3 роки", test: (a: number) => a <= 3 },
  { id: "4-5", label: "4–5 років", test: (a: number) => a >= 4 && a <= 5 },
  { id: "6-8", label: "6–8 років", test: (a: number) => a >= 6 },
] as const;

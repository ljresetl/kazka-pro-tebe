// Тексти сторінок тем (/temy/[id]). Кожна тема має власний текст,
// а спільні абзаци (про фото, героїв, ціни) додаються з кількох варіантів,
// щоб сторінки не повторювали одна одну дослівно.
import { ALL_TOPICS, findTopic } from "../../catalog";
import { EBOOK_PRICE, PRINT_PRICE } from "../../book-facts";
import type { ThemeText } from "../theme-types";
import { KAZKY } from "./kazky";
import { NAVCHALNI } from "./navchalni";
import { NOVI } from "./nova";
import { POCHUTTIA } from "./pochuttia";
import { PRYHODY } from "./pryhody";
import { RODYNA } from "./rodyna";
import { SVIATA } from "./sviata";
import { SVITY } from "./svity";
import { ZANIATTIA } from "./zaniattia";

export const THEME_TEXTS: ThemeText[] = [...KAZKY, ...PRYHODY, ...ZANIATTIA, ...SVITY, ...SVIATA, ...RODYNA, ...NAVCHALNI, ...POCHUTTIA, ...NOVI];

const BY_ID = new Map(THEME_TEXTS.map((t) => [t.id, t]));

export function getThemeText(id: string) {
  return BY_ID.get(id);
}

/** Стабільний вибір варіанта для теми (той самий при кожній збірці). */
export function pick<T>(key: string, list: T[]): T {
  let h = 0;
  for (const ch of key) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return list[h % list.length];
}

// Спільні продовження абзаців. {T} — назва теми в нижньому регістрі.
const WHY_TAIL = [
  "Ви побачите, як дитина відкриває обкладинку, впізнає себе на першій ілюстрації — і на мить завмирає. Саме заради цієї миті й створюють іменні книжки.",
  "Найцінніше в такій книжці — момент, коли дитина вперше чує своє ім'я в казці й перепитує: «Це про мене?» Так, про неї.",
  "Дитина слухає уважніше, коли історія про неї саму: власне ім'я тримає увагу краще за будь-яку яскраву картинку.",
];
const HERO_TAIL = [
  "Завантажте фото — і ілюстрації намалюємо так, щоб дитину було легко впізнати навіть у казковому світі. Додайте ще до чотирьох героїв: братика чи сестричку, найкращого друга, бабусю або песика.",
  "Можна додати фото дитини: художник-ШІ перенесе її риси в обраний стиль ілюстрацій. А в історії поруч може бути ще до чотирьох героїв — рідні, друзі, улюбленці чи іграшки.",
  "Ім'я, вік, захоплення й улюблена страва — усе це з'явиться в історії. За бажанням додайте фото для ілюстрацій і ще до чотирьох персонажів, які вирушать у пригоду разом.",
];
const GIVES_TAIL = [
  "Ми не обіцяємо, що після однієї книжки все зміниться. Але історія, де головний герой — ти сам, запам'ятовується надовго й дає привід для розмов.",
  "Жодних повчань — лише пригода, у якій дитина сама доходить висновку. Тому книжку й хочеться перечитувати.",
  "Мораль історії ви обираєте самі: дружба, сміливість, турбота про природу, чесність чи повага. Вона вплітається в сюжет, а не звучить як нотація.",
];
const GIFT_TAIL = [
  "Вікові групи — від 0–2 років, де досить коротких речень і повторів, до 10+, де сюжет складніший, а герої говорять як підлітки.",
  "Для найменших текст короткий і ритмічний, для школярів — довший, з діалогами й несподіваними поворотами.",
  "Книжку можна подарувати на день народження, Миколая, Новий рік, випускний — або просто так, бо захотілося порадувати.",
];

export type ThemeSection = { title: string; text: string; link?: { href: string; label: string; before: string } };

/** Повний текст сторінки теми: п'ять розділів із посиланнями, як на зразку. */
export function themeSections(id: string): ThemeSection[] {
  const t = BY_ID.get(id);
  const found = findTopic(id);
  if (!t || !found) return [];
  const label = found.topic.label.toLowerCase();
  return [
    {
      title: `Чому ця історія зачепить серце`,
      text: `${t.why} ${pick(id + "w", WHY_TAIL)}`,
      link: { before: "Почитайте", href: "/vidhuky", label: "що кажуть інші батьки" },
    },
    {
      title: `Як ваша дитина стане головним героєм`,
      text: `${t.hero} ${pick(id + "h", HERO_TAIL)}`,
      link: { before: "Більше про персоналізацію — на сторінці", href: "/mozhlyvosti", label: "можливостей" },
    },
    { title: "Що книжка дає дитині", text: `${t.gives} ${pick(id + "g", GIVES_TAIL)}` },
    {
      title: "Кому це ідеальний подарунок",
      text: `${t.gift} ${pick(id + "p", GIFT_TAIL)}`,
      link: { before: "Більше натхнення — серед", href: "/idei", label: "усіх ідей для книжок" },
    },
    {
      title: "Як історія живе після останньої сторінки",
      text: `${t.after} Е-книгу ви отримуєте одразу за ${EBOOK_PRICE}, а друковану книжку у твердій обкладинці можна замовити за ${PRINT_PRICE}.`,
      link: { before: "Почніть", href: `/stvoryty?tema=${id}`, label: `власну книжку на тему «${label}»` },
    },
  ];
}

export const THEME_IDS = ALL_TOPICS.map((x) => x.topic.id).filter((id) => BY_ID.has(id));

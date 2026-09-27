// Як вибір у конструкторі перетворюється на запит до генератора казки.
// ШІ отримує все дослівно; шаблонний генератор (без ключів ШІ) бере
// найближчу з шести пригод і найближчу рису характеру.
import { findTopic, MORALS } from "./catalog";
import type { BookOptions, Character, ThemeId } from "./types";

const TOPIC_THEME: Record<string, ThemeId> = {
  kosmos: "space",
  maibutnie: "space",
  "podorozh-u-chasi": "space",
  litak: "space",
  "kazka-na-nich": "space",
  mriia: "space",
  "strakh-temriavy": "space",
  "charivnyi-lis": "forest",
  fei: "forest",
  hnomy: "forest",
  kempinh: "forest",
  skarb: "forest",
  "taiemna-misiia": "forest",
  "budynochok-na-derevi": "forest",
  "pidvodnyi-svit": "sea",
  rusalky: "sea",
  piraty: "sea",
  podorozhi: "sea",
  vidpustka: "sea",
  "pivnichnyi-polius": "sea",
  dynozavry: "dino",
  "kamianyi-vik": "dino",
  dzhunhli: "dino",
  savana: "dino",
  pryntsesy: "castle",
  lytsari: "castle",
  yedynorohy: "castle",
  veletni: "castle",
  "charivna-shkola": "castle",
  chariviyky: "castle",
  seredniovichchia: "castle",
  vikinhy: "castle",
  "budynok-pryvydiv": "castle",
  "tysiacha-nochei": "castle",
  "kozatska-sich": "castle",
};

/** Теми, для яких є власний готовий сюжет (без ШІ). */
const DIRECT_TOPICS = new Set(["kosmos", "charivnyi-lis", "pidvodnyi-svit", "dynozavry", "lytsari"]);

const MORAL_TRAIT: Record<string, string> = {
  druzhba: "вміння дружити",
  smilyvist: "сміливість",
  pryroda: "доброта",
  liubov: "доброта",
  napolehlyvist: "терплячість",
  dilytysia: "доброта",
  chesnist: "доброта",
  povaha: "вміння дружити",
};

export function themeForTopic(topic?: string): ThemeId {
  return (topic && TOPIC_THEME[topic]) || "meadow";
}

export function hasDirectTemplate(topic?: string) {
  return Boolean(topic && DIRECT_TOPICS.has(topic));
}

export function traitForMoral(moral?: string) {
  return (moral && MORAL_TRAIT[moral]) || "сміливість";
}

export function moralLabel(moral?: string) {
  return MORALS.find((m) => m.id === moral)?.label;
}

/** «песик Бублик» — як назвати першого додаткового героя в тексті. */
export function friendFrom(characters?: Character[]) {
  const c = characters?.find((x) => x.name.trim());
  if (!c) return undefined;
  return [c.relation?.trim(), c.name.trim()].filter(Boolean).join(" ").slice(0, 40);
}

function cap(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

/** Текст присвяти з полів «від кого» і «привід», якщо батьки не написали свій. */
export function composeDedication(name: string, o: BookOptions): string | undefined {
  const from = o.dedicationFrom?.trim();
  if (!from) return undefined;
  const occasion = o.occasion?.trim();
  const text = occasion
    ? `${name}! ${cap(occasion)} — чудовий привід для казки про тебе. З любов'ю, ${from}.`
    : `${name}, ця казка — про тебе. З любов'ю, ${from}.`;
  return text.slice(0, 200);
}

/** Короткий опис вибору для ШІ та для сторінки казки. */
export function describeOptions(o: BookOptions) {
  const found = o.topic ? findTopic(o.topic) : null;
  return {
    category: found?.category.label,
    topic: found?.topic.label,
    topicEn: found?.topic.en,
    moral: moralLabel(o.moral),
  };
}

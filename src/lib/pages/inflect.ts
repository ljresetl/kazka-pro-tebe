// Підстановка імені й роду в шаблонні тексти.
// {N} — ім'я (називний), {G} — ім'я в родовому («для Адама»),
// {хлопчик|дівчинка} — форма для хлопчика або дівчинки.
export type Gender = "m" | "f";

export function inflect(text: string, name: string, g: Gender, gen = name) {
  return text
    .replace(/\{N\}/g, name)
    .replace(/\{G\}/g, gen)
    .replace(/\{([^{}|]*)\|([^{}|]*)\}/g, (_, m: string, f: string) => (g === "m" ? m : f));
}

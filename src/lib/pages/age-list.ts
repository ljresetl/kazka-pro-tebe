// Сторінки за віком (/vik/[slug]): від немовляти до 15 років.
export type AgeEntry = { slug: string; years: number; label: string; short: string; group: "0-2" | "3-5" | "6-9" | "10+" };

function word(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "рік";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "роки";
  return "років";
}

export const AGES: AgeEntry[] = [
  { slug: "nemovlia", years: 0, label: "Немовля (0–1 рік)", short: "Немовля", group: "0-2" },
  ...Array.from({ length: 15 }, (_, i) => {
    const n = i + 1;
    const group: AgeEntry["group"] = n <= 2 ? "0-2" : n <= 5 ? "3-5" : n <= 9 ? "6-9" : "10+";
    return { slug: `${n}-${word(n) === "рік" ? "rik" : word(n) === "роки" ? "roky" : "rokiv"}`, years: n, label: `${n} ${word(n)}`, short: `${n} ${word(n)}`, group };
  }),
];

export function getAge(slug: string) {
  return AGES.find((a) => a.slug === slug);
}

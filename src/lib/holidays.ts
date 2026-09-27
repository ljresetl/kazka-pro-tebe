// Найближче свято для банера на головній («До Миколая — 69 днів»).
// Великдень і День матері рахуються для кожного року.

export type Holiday = { label: string; topic: string; date: Date; gift: string };

function orthodoxEaster(year: number) {
  // Алгоритм Мееуса для юліанського календаря + перехід на григоріанський.
  const a = year % 4;
  const b = year % 7;
  const c = year % 19;
  const d = (19 * c + 15) % 30;
  const e = (2 * a + 4 * b - d + 34) % 7;
  const month = Math.floor((d + e + 114) / 31);
  const day = ((d + e + 114) % 31) + 1;
  const julian = new Date(year, month - 1, day);
  julian.setDate(julian.getDate() + 13);
  return julian;
}

function nthSunday(year: number, month: number, n: number) {
  const d = new Date(year, month, 1);
  const shift = (7 - d.getDay()) % 7;
  return new Date(year, month, 1 + shift + (n - 1) * 7);
}

function holidaysOf(year: number): Holiday[] {
  return [
    { label: "День святого Валентина", topic: "valentyn", date: new Date(year, 1, 14), gift: "казку про любов" },
    { label: "Великдень", topic: "velykden", date: orthodoxEaster(year), gift: "великодню казку" },
    { label: "День матері", topic: "den-materi", date: nthSunday(year, 4, 2), gift: "казку для мами й дитини" },
    { label: "День захисту дітей", topic: "den-ditei", date: new Date(year, 5, 1), gift: "казку-подарунок" },
    { label: "День батька", topic: "den-batka", date: nthSunday(year, 5, 3), gift: "казку про тата й дитину" },
    { label: "Івана Купала", topic: "kupala", date: new Date(year, 6, 7), gift: "купальську казку" },
    { label: "Перший дзвоник", topic: "pershyi-dzvonyk", date: new Date(year, 8, 1), gift: "казку про школу" },
    { label: "Гелловін", topic: "helovin", date: new Date(year, 9, 31), gift: "веселу гарбузову казку" },
    { label: "День святого Миколая", topic: "mykolai", date: new Date(year, 11, 6), gift: "казку під подушку" },
    { label: "Різдво", topic: "rizdvo", date: new Date(year, 11, 25), gift: "різдвяну казку" },
  ];
}

const DAY = 24 * 60 * 60 * 1000;

/** Найближче свято, до якого ще щонайменше 3 дні (щоб встигнути з друком). */
export function nextHoliday(now: Date): { holiday: Holiday; days: number } {
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const list = [...holidaysOf(today.getFullYear()), ...holidaysOf(today.getFullYear() + 1)]
    .map((h) => ({ holiday: h, days: Math.round((h.date.getTime() - today.getTime()) / DAY) }))
    .filter((x) => x.days >= 3)
    .sort((a, b) => a.days - b.days);
  return list[0];
}

export function daysWord(n: number) {
  const m10 = n % 10;
  const m100 = n % 100;
  if (m10 === 1 && m100 !== 11) return "день";
  if (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) return "дні";
  return "днів";
}

export type Idea = {
  /** Адреса сторінки /idei/[slug]. */
  slug: string;
  title: string;
  emoji: string;
  /** Тема каталогу, з якою відкривається конструктор. */
  topic: string;
  /** Категорії (id з IDEA_TAGS). */
  tags: string[];
  /** Один рядок під заголовком. */
  short: string;
  /** Докладніше про ідею. */
  long: string;
  /** Уривок історії. */
  sample: string;
  /** Варіанти назви книжки. */
  titles: string[];
  /** Чим корисна така книжка. */
  why: string;
};

export const IDEA_TAGS: { id: string; label: string; main?: boolean }[] = [
  { id: "pryhody", label: "Пригоди", main: true },
  { id: "fentezi", label: "Фентезі", main: true },
  { id: "kazka", label: "Казка", main: true },
  { id: "druzhba", label: "Дружба", main: true },
  { id: "pryroda", label: "Природа", main: true },
  { id: "rodyna", label: "Родина", main: true },
  { id: "kulinariia", label: "Кулінарія", main: true },
  { id: "abetka", label: "Абетка" },
  { id: "dynozavry", label: "Динозаври" },
  { id: "emotsii", label: "Емоції" },
  { id: "istoriia", label: "Історія" },
  { id: "pro-tvaryn", label: "Книжки про тварин" },
  { id: "dlia-maliukiv", label: "Для малюків" },
  { id: "mahiia", label: "Магія" },
  { id: "na-nich", label: "На ніч" },
  { id: "misiachne", label: "Місячне світло" },
  { id: "mify", label: "Міфи й легенди" },
  { id: "kartynky", label: "Книжка з картинками" },
  { id: "piraty", label: "Пірати" },
  { id: "virshi", label: "Віршики" },
  { id: "rozpovid", label: "Оповідання" },
  { id: "tvaryny", label: "Тварини" },
  { id: "pryntsesy", label: "Принцеси" },
  { id: "pershe-chytannia", label: "Перше читання" },
  { id: "shkola", label: "Школа" },
  { id: "solodoshchi", label: "Солодощі" },
  { id: "slovnychok", label: "Словничок" },
  { id: "sport", label: "Спорт" },
  { id: "strashylky", label: "Лагідні страшилки" },
  { id: "sviata", label: "Свята" },
  { id: "rizdvo", label: "Різдво й Миколай" },
  { id: "kosmos", label: "Космос" },
  { id: "osvita", label: "Навчання" },
  { id: "zahadka", label: "Загадки й детективи" },
  { id: "zdorovia", label: "Здоров'я" },
  { id: "zuby", label: "Догляд за зубами" },
  { id: "zviriata", label: "Звірятка" },
  { id: "ukraina", label: "Україна" },
  { id: "muzyka", label: "Музика" },
  { id: "smishni", label: "Смішні історії" },
];

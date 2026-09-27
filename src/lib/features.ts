// Перемикачі можливостей. Вмикаються змінними середовища під час збірки,
// щоб після переїзду на сервер не треба було міняти код.

/** Казки пише Claude (потрібен сервер і ANTHROPIC_API_KEY). */
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "1";

/** Сайт зібрано як статичний (GitHub Pages) — сервера немає. */
export const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_SITE === "1";

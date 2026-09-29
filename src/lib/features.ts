// Перемикачі можливостей. Вмикаються змінними середовища під час збірки,
// щоб після переїзду на сервер не треба було міняти код.

/** Казки пише Claude (потрібен сервер і ANTHROPIC_API_KEY). */
export const AI_ENABLED = process.env.NEXT_PUBLIC_AI_ENABLED === "1";

/** Сайт зібрано як статичний (GitHub Pages) — сервера немає. */
export const STATIC_SITE = process.env.NEXT_PUBLIC_STATIC_SITE === "1";

/** Ілюстрації до казок малює Gemini (потрібен сервер і GEMINI_API_KEY). */
export const AI_IMAGES = process.env.NEXT_PUBLIC_AI_IMAGES === "1";

/**
 * Створення нових казок тимчасово вимкнене (кожна казка коштує грошей на Gemini).
 * Вимикає конструктор, «Інший сюжет», малювання й серверні /api/story та /api/illustrate.
 * Щоб відкрити — поставте false.
 */
export const CREATION_PAUSED = true;
export const CREATION_PAUSED_MESSAGE = "Створення нових казок тимчасово призупинене. Зовсім скоро відкриємо знову!";

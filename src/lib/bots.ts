// Хто може читати сайт автоматично. Пускаємо пошуковики (Google, Bing, DuckDuckGo, Apple, Yandex…),
// прев'ю посилань у месенджерах і офіційних ШІ-ботів великих компаній (OpenAI, Anthropic, Google,
// Apple, Microsoft, Perplexity, Meta, Amazon) — щоб сайт з'являвся у відповідях ChatGPT, Claude,
// Gemini, Perplexity. Анонімні збирачі даних, SEO-скрапери й програми для скачування — ні.

/** Збирачі даних без користі для сайту (для robots.txt і блокування на сервері). */
export const BAD_BOTS = [
  "CCBot",
  "Bytespider",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Omgili",
  "Timpibot",
  "AI2Bot",
  "Ai2Bot-Dolma",
  "cohere-training-data-crawler",
  "Scrapy",
  "img2dataset",
  "AhrefsBot",
  "SemrushBot",
  "MJ12bot",
  "DotBot",
  "DataForSeoBot",
  "BLEXBot",
];

// Програми й бібліотеки для автоматичного зчитування сторінок.
const TOOLS = [
  "python-requests",
  "python-urllib",
  "aiohttp",
  "httpx",
  "scrapy",
  "curl/",
  "wget",
  "go-http-client",
  "node-fetch",
  "undici",
  "axios",
  "okhttp",
  "java/",
  "apache-httpclient",
  "libwww-perl",
  "php/",
  "guzzlehttp",
  "httrack",
  "headlesschrome",
  "phantomjs",
  "puppeteer",
  "playwright",
  "selenium",
  "img2dataset",
];

const BLOCKED = new RegExp([...BAD_BOTS, ...TOOLS].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|"), "i");

/** Чи треба відмовити цьому запиту (порожній User-Agent — теж скрипт). */
export function isBlockedAgent(userAgent: string | null) {
  const ua = userAgent?.trim() ?? "";
  return ua === "" || BLOCKED.test(ua);
}

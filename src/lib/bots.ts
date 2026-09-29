// Хто може читати сайт автоматично. Пошуковики (Google, Bing, DuckDuckGo, Apple, Yandex тощо)
// та прев'ю посилань у месенджерах пускаємо; ШІ-збирачі текстів і програми-скрапери — ні.

/** ШІ-боти, які збирають тексти й картинки для навчання моделей (для robots.txt). */
export const AI_BOTS = [
  "GPTBot",
  "ChatGPT-User",
  "OAI-SearchBot",
  "ClaudeBot",
  "Claude-Web",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "Google-Extended",
  "Applebot-Extended",
  "CCBot",
  "PerplexityBot",
  "Perplexity-User",
  "Bytespider",
  "Amazonbot",
  "meta-externalagent",
  "meta-externalfetcher",
  "FacebookBot",
  "cohere-ai",
  "cohere-training-data-crawler",
  "Diffbot",
  "ImagesiftBot",
  "Omgilibot",
  "Omgili",
  "Timpibot",
  "YouBot",
  "AI2Bot",
  "Ai2Bot-Dolma",
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

const BLOCKED = new RegExp([...AI_BOTS, ...TOOLS].map((s) => s.replace(/[.*+?^${}()|[\]\\/]/g, "\\$&")).join("|"), "i");

/** Чи треба відмовити цьому запиту (порожній User-Agent — теж скрипт). */
export function isBlockedAgent(userAgent: string | null) {
  const ua = userAgent?.trim() ?? "";
  return ua === "" || BLOCKED.test(ua);
}

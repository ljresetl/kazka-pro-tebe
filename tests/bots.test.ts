import { describe, expect, it } from "vitest";
import { isBlockedAgent } from "@/lib/bots";

describe("хто може читати сайт", () => {
  it("пускає браузери, пошуковики й прев'ю посилань", () => {
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
      "TelegramBot (like TwitterBot)",
      "facebookexternalhit/1.1",
      "WhatsApp/2.23",
    ]) expect(isBlockedAgent(ua), ua).toBe(false);
  });

  it("не пускає ШІ-збирачів і програми-скрапери", () => {
    for (const ua of [
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "CCBot/2.0 (https://commoncrawl.org/faq/)",
      "python-requests/2.32.3",
      "curl/8.9.1",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0 Safari/537.36",
      "",
      null,
    ]) expect(isBlockedAgent(ua), String(ua)).toBe(true);
  });
});

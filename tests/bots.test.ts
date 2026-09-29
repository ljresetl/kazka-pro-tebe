import { describe, expect, it } from "vitest";
import { isBlockedAgent } from "@/lib/bots";

describe("хто може читати сайт", () => {
  it("пускає браузери, пошуковики, прев'ю посилань і офіційних ШІ-ботів", () => {
    for (const ua of [
      "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0 Safari/537.36",
      "Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)",
      "Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)",
      "DuckDuckBot/1.1; (+http://duckduckgo.com/duckduckbot.html)",
      "TelegramBot (like TwitterBot)",
      "facebookexternalhit/1.1",
      "WhatsApp/2.23",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko; compatible; GPTBot/1.2; +https://openai.com/gptbot)",
      "Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko); compatible; OAI-SearchBot/1.0; +https://openai.com/searchbot",
      "Mozilla/5.0 (compatible; ClaudeBot/1.0; +claudebot@anthropic.com)",
      "Mozilla/5.0 (compatible; PerplexityBot/1.0; +https://perplexity.ai/perplexitybot)",
      "Mozilla/5.0 (compatible; AhrefsBot/7.0; +http://ahrefs.com/robot/)",
      "Mozilla/5.0 (compatible; SemrushBot/7~bl; +http://www.semrush.com/bot.html)",
    ]) expect(isBlockedAgent(ua), ua).toBe(false);
  });

  it("не пускає збирачів даних і програми-скрапери", () => {
    for (const ua of [
      "CCBot/2.0 (https://commoncrawl.org/faq/)",
      "Mozilla/5.0 (Linux; Android 5.0) AppleWebKit/537.36 (KHTML, like Gecko) Mobile Safari/537.36 (compatible; Bytespider; spider-feedback@bytedance.com)",
      "Mozilla/5.0 (compatible; MJ12bot/v1.4.8; http://mj12bot.com/)",
      "python-requests/2.32.3",
      "curl/8.9.1",
      "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/140.0 Safari/537.36",
      "",
      null,
    ]) expect(isBlockedAgent(ua), String(ua)).toBe(true);
  });
});

import { describe, expect, it, vi } from "vitest";

// Перемикач паузи створення казок: тести перевіряють роботу API у звичайному режимі,
// а окремий тест — що на паузі сервер відмовляє.
const pause = vi.hoisted(() => ({ on: false }));
vi.mock("@/lib/features", async (orig) => ({
  ...(await orig<typeof import("@/lib/features")>()),
  get CREATION_PAUSED() {
    return pause.on;
  },
}));
import { POST as illustrate } from "@/app/api/illustrate/route";
import { POST as payment } from "@/app/api/payment/route";
import { POST as createStory } from "@/app/api/story/route";

const json = (url: string, body: unknown, ip = "1.1.1.1") =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
  });

describe("Пауза створення казок", () => {
  it("на паузі /api/story і /api/illustrate повертають 503", async () => {
    pause.on = true;
    try {
      const a = await createStory(json("http://x/api/story", { childName: "Тимко", gender: "boy", age: 5, theme: "dino" }, "9.9.9.9"));
      const b = await illustrate(json("http://x/api/illustrate", {}, "9.9.9.8"));
      expect(a.status).toBe(503);
      expect(b.status).toBe(503);
    } finally {
      pause.on = false;
    }
  });
});

describe("API /api/story (без ключів ШІ — шаблонні казки)", () => {
  it("створює казку", async () => {
    const res = await createStory(
      json("http://x/api/story", { childName: "Тимко", gender: "boy", age: 5, theme: "dino", trait: "доброта" }),
    );
    expect(res.status).toBe(200);
    const story = await res.json();
    expect(story.title).toContain("Тимко");
    expect(story.source).toBe("template");
    expect(story.pages.length).toBeGreaterThan(5);
  });

  it("відхиляє неправильні дані", async () => {
    const res = await createStory(json("http://x/api/story", { childName: "", gender: "x" }, "2.2.2.2"));
    expect(res.status).toBe(400);
  });

  it("одна безкоштовна казка на добу з адреси, з підписом для ілюстрацій", async () => {
    const body = { childName: "Аня", gender: "girl", age: 4, theme: "sea", trait: "доброта" };
    const first = await createStory(json("http://x/api/story", body, "3.3.3.3"));
    expect(first.status).toBe(200);
    expect((await first.json()).ticket).toMatch(/^[\w-]{32}$/);
    const second = await createStory(json("http://x/api/story", body, "3.3.3.3"));
    expect(second.status).toBe(429);
    expect((await second.json()).code).toBe("quota");
  });
});

describe("API без налаштованих ключів", () => {
  it("/api/illustrate повертає 503", async () => {
    delete process.env.GEMINI_API_KEY;
    const res = await illustrate(json("http://x/api/illustrate", {}));
    expect(res.status).toBe(503);
  });

  it("/api/payment повертає 503", async () => {
    delete process.env.LIQPAY_PUBLIC_KEY;
    const res = await payment(json("http://x/api/payment", {}));
    expect(res.status).toBe(503);
  });
});

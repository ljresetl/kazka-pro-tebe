import { describe, expect, it } from "vitest";
import { POST as illustrate } from "@/app/api/illustrate/route";
import { POST as payment } from "@/app/api/payment/route";
import { POST as createStory } from "@/app/api/story/route";

const json = (url: string, body: unknown, ip = "1.1.1.1") =>
  new Request(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "x-forwarded-for": ip },
    body: JSON.stringify(body),
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

  it("обмежує кількість казок з однієї адреси", async () => {
    const body = { childName: "Аня", gender: "girl", age: 4, theme: "sea", trait: "доброта" };
    const statuses: number[] = [];
    for (let i = 0; i < 10; i++) statuses.push((await createStory(json("http://x/api/story", body, "3.3.3.3"))).status);
    expect(statuses.slice(0, 8).every((s) => s === 200)).toBe(true);
    expect(statuses.at(-1)).toBe(429);
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

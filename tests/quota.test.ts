import { describe, expect, it } from "vitest";
import { markPaid, storiesLeft, storyTicket, takeImage, takeStory, validTicket } from "@/lib/quota";

// Без Redis лічильники живуть у пам'яті — цього досить, щоб перевірити правила.
describe("ліміти казок і ілюстрацій", () => {
  it("одна казка на добу з адреси, покупка додає ще одну", async () => {
    const ip = "10.0.0.1";
    expect(await takeStory(ip)).toBe(true);
    expect(await takeStory(ip)).toBe(false);
    await markPaid(["s1"], ip);
    expect(await storiesLeft(ip)).toBe(1);
    expect(await takeStory(ip)).toBe(true);
    expect(await takeStory(ip)).toBe(false);
    expect(await takeStory("10.0.0.2")).toBe(true);
  });

  it("до оплати — лист персонажів, обкладинка, 3 сторінки й 2 повтори; після оплати — вся книжка", async () => {
    const id = "story-a";
    for (let i = 0; i < 7; i++) expect((await takeImage(id)).ok).toBe(true);
    expect((await takeImage(id)).ok).toBe(false);
    await markPaid([id]);
    for (let i = 0; i < 10; i++) expect((await takeImage(id)).ok).toBe(true);
  });

  it("підпис казки не підробити", () => {
    const t = storyTicket("abc");
    expect(validTicket("abc", t)).toBe(true);
    expect(validTicket("abd", t)).toBe(false);
    expect(validTicket("abc", undefined)).toBe(false);
    expect(validTicket("abc", "x".repeat(t.length))).toBe(false);
  });
});

describe("підпис оплати", () => {
  it("відкриває всю книжку навіть без пам'яті сервера, підробка не працює", async () => {
    const { paidTicket, takeImage } = await import("@/lib/quota");
    const id = "story-b";
    for (let i = 0; i < 7; i++) await takeImage(id);
    expect((await takeImage(id, "x".repeat(32))).ok).toBe(false);
    expect((await takeImage(id, paidTicket("інша"))).ok).toBe(false);
    const ok = await takeImage(id, paidTicket(id));
    expect(ok).toEqual({ ok: true, paid: true });
  });
});

describe("розмальовка від ШІ", () => {
  it("лише для оплачених книжок і не більше 30 сторінок", async () => {
    const { paidTicket, takeColoring } = await import("@/lib/quota");
    expect((await takeColoring("c1", undefined)).ok).toBe(false);
    expect((await takeColoring("c1", paidTicket("c2"))).ok).toBe(false);
    for (let i = 0; i < 30; i++) expect((await takeColoring("c1", paidTicket("c1"))).ok).toBe(true);
    expect(await takeColoring("c1", paidTicket("c1"))).toEqual({ ok: false, reason: "limit" });
  });
});

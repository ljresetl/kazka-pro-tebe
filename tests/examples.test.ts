import { describe, expect, it } from "vitest";
import { EXAMPLES } from "@/lib/examples";
import longTexts from "@/lib/examples-texts.json";

describe("приклади казок", () => {
  it("10 прикладів із вичитаними довгими текстами", () => {
    expect(EXAMPLES).toHaveLength(10);
    const texts = longTexts as Record<string, string[]>;
    for (const e of EXAMPLES) {
      expect(texts[e.slug], e.slug).toBeDefined();
      expect(e.pages.map((p) => p.text)).toEqual(texts[e.slug]);
    }
  });

  it("у текстах немає латинських літер і зламаних лапок", () => {
    for (const e of EXAMPLES) {
      for (const p of e.pages) {
        expect(p.text, e.slug).not.toMatch(/[A-Za-z]/);
        expect(p.text.split("«").length, e.slug).toBe(p.text.split("»").length);
      }
    }
  });

  it("у казки про Соломію є картинка на кожній сторінці", () => {
    const s = EXAMPLES.find((e) => e.slug === "solomiia-i-mushlia")!;
    expect(s.coverImage).toBeDefined();
    expect(s.pages.every((p) => p.image)).toBe(true);
  });
});

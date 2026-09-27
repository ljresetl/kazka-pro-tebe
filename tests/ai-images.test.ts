import { describe, expect, it } from "vitest";
import { buildPrompt, heroDescription } from "@/lib/ai-images";

const req = {
  gender: "girl" as const,
  age: 5,
  heroSeed: 7,
  theme: "sea",
  title: "Соломія і мушля, що співає",
  kind: "page" as const,
  pageText: "Соломія сіла на пісок і заспівала.",
};

describe("запит до художника-ШІ", () => {
  it("герой однаковий для однієї казки й відповідає статі", () => {
    expect(heroDescription("girl", 5, 7)).toBe(heroDescription("girl", 5, 7));
    expect(heroDescription("girl", 5, 7)).toContain("5-year-old girl");
    for (let seed = 0; seed < 20; seed++) expect(heroDescription("boy", 6, seed)).not.toContain("dress");
  });

  it("враховує пригоду, текст сторінки, друга й забороняє текст на картинці", () => {
    const p = buildPrompt({ ...req, friend: "песик Бублик" });
    expect(p).toContain("seaside");
    expect(p).toContain(req.pageText);
    expect(p).toContain("песик Бублик");
    expect(p).toContain("no text");
    expect(p).not.toMatch(/photo|photograph/i);
  });

  it("для обкладинки використовує назву, для сторінки — опис від ШІ, якщо він є", () => {
    expect(buildPrompt({ ...req, kind: "cover" })).toContain(req.title);
    const withIll = buildPrompt({ ...req, illustration: "the child sings on the beach" });
    expect(withIll).toContain("the child sings on the beach");
    expect(withIll).not.toContain(req.pageText);
  });
});

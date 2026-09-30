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

  it("враховує пригоду, текст сторінки, друга й просить картинку без написів (позитивно)", () => {
    const p = buildPrompt({ ...req, friend: "песик Бублик" });
    expect(p).toContain("seaside");
    expect(p).toContain(req.pageText);
    expect(p).toContain("песик Бублик");
    expect(p).toContain("without any letters or numbers");
    expect(p).toContain("five fingers");
    expect(p).not.toMatch(/photo|photograph/i);
  });

  it("для обкладинки використовує назву, для сторінки — опис від ШІ, якщо він є", () => {
    expect(buildPrompt({ ...req, kind: "cover" })).toContain(req.title);
    const withIll = buildPrompt({ ...req, illustration: "the child sings on the beach" });
    expect(withIll).toContain("the child sings on the beach");
    expect(withIll).not.toContain(req.pageText);
  });

  it("бере стиль і тему з конструктора, інших героїв і фото лише за прапорцем", () => {
    const p = buildPrompt({ ...req, style: "plastylin", topic: "pozhezhnyky", companions: ["Bublyk (песик, animal)"] });
    expect(p).toContain("claymation");
    expect(p).toContain("firefighters");
    expect(p).toContain("Bublyk");
    expect(p).not.toMatch(/photo/i);
    expect(buildPrompt({ ...req, kind: "cover", hasPhoto: true }, { refA: "photo" })).toContain("photo of the real child");
  });
});

describe("сторінка зі зразками", () => {
  const r = { gender: "girl" as const, age: 4, heroSeed: 3, theme: "sea", title: "Т", kind: "page" as const, pageText: "текст", page: 4 };

  it("з листом персонажів не містить випадкового опису героя, лише опис з листа", () => {
    const p = buildPrompt({ ...r, heroLook: "a girl in a mint dress with orange crabs" }, { refA: "sheet", prev: true });
    expect(p).not.toContain(heroDescription("girl", 4, 3));
    expect(p).toContain("character reference sheet");
    expect(p).toContain("previous page");
    expect(p).toContain("mint dress with orange crabs");
    expect(p).toContain("brand-new scene");
  });

  it("атмосфера й предмети — на кожній сторінці, мета сторінки вказана", () => {
    const p = buildPrompt({ ...r, setting: "night, a thin crescent moon", cast: ["Balls: exactly three balls, red, green, blue"] }, { refA: "sheet" });
    expect(p).toContain("page 5 of 12");
    expect(p).toContain("crescent moon");
    expect(p).toContain("exactly three balls");
  });

  it("лист персонажів — на білому фоні, з усіма ракурсами", () => {
    const p = buildPrompt({ ...r, kind: "sheet" }, { refA: "photo" });
    expect(p).toContain("front view, side view and back view");
    expect(p).toContain("photo of the real child");
  });
});

import { describe, expect, it } from "vitest";
import { PLOTS, plotCount, templateStory, yearsWord } from "@/lib/template-story";
import type { StoryRequest, ThemeId } from "@/lib/types";

const THEMES = Object.keys(PLOTS) as ThemeId[];
const base: StoryRequest = { childName: "Марійка", gender: "girl", age: 5, theme: "space", trait: "сміливість" };

// Текст не повинен містити залишків розмітки, латинських літер у словах, зламаних пробілів.
function assertClean(text: string) {
  expect(text).not.toMatch(/\{\{|\}\}|\[\[|\]\]|\$\{|undefined|null/);
  expect(text).not.toMatch(/[А-ЯІЇЄҐа-яіїєґ][A-Za-z]|[A-Za-z][А-ЯІЇЄҐа-яіїєґ]/);
  expect(text).not.toMatch(/\s{2,}|\s[.,!?:;»]|«\s/);
  expect(text.split("«").length).toBe(text.split("»").length);
}

describe("yearsWord", () => {
  it("правильно відмінює вік", () => {
    expect(yearsWord(1)).toBe("1 рік");
    expect(yearsWord(3)).toBe("3 роки");
    expect(yearsWord(5)).toBe("5 років");
    expect(yearsWord(11)).toBe("11 років");
    expect(yearsWord(22)).toBe("22 роки");
  });
});

describe("шаблонні казки", () => {
  it("кожна пригода має щонайменше два сюжети", () => {
    for (const t of THEMES) expect(plotCount(t)).toBeGreaterThanOrEqual(2);
  });

  it("усі сюжети рендеряться без помилок у різних налаштуваннях", () => {
    for (const theme of THEMES) {
      for (let v = 0; v < plotCount(theme); v++) {
        for (const seed of [1, 2, 3, 4, 5]) {
          const variants: StoryRequest[] = [
            { ...base, theme },
            { ...base, theme, childName: "Тимко", gender: "boy", age: 3, friend: "песик Бублик", trait: "доброта" },
            { ...base, theme, childName: "Злата", age: 8, trait: "вміння дружити", message: "Любимо тебе!" },
          ];
          for (const req of variants) {
            const s = templateStory(req, v, seed);
            expect(s.title).toContain(req.childName);
            expect(s.pages.length).toBeGreaterThanOrEqual(6);
            for (const p of s.pages) assertClean(p.text);
          }
        }
      }
    }
  });

  it("рід дієслів відповідає статі героя", () => {
    const girl = templateStory({ ...base, theme: "sea" }, 1, 7)
      .pages.map((p) => p.text)
      .join(" ");
    const boy = templateStory({ ...base, theme: "sea", gender: "boy", childName: "Максим" }, 1, 7)
      .pages.map((p) => p.text)
      .join(" ");
    expect(girl).toContain("схопила");
    expect(girl).not.toContain("схопив ");
    expect(boy).toContain("схопив");
    expect(boy).not.toContain("схопила");
  });

  it("для малюків 2–3 років казка коротша", () => {
    const len = (age: number) => templateStory({ ...base, age }, 0, 11).pages.reduce((sum, p) => sum + p.text.length, 0);
    expect(len(3)).toBeLessThan(len(6) * 0.8);
  });

  it("друг з’являється на початку, посередині й у фіналі", () => {
    const s = templateStory({ ...base, friend: "кішка Мурка" }, 0, 3);
    expect(s.pages[0].text).toContain("кішка Мурка");
    expect(s.pages[5].text.toLowerCase()).toContain("кішка мурка");
    expect(s.pages.at(-1)!.text.toLowerCase()).toContain("кішка мурка");
  });

  it("однаковий seed — однакова казка, різні seed — різні формулювання", () => {
    const a = templateStory(base, 0, 42);
    expect(templateStory(base, 0, 42)).toEqual(a);
    const texts = new Set(
      Array.from({ length: 8 }, (_, i) =>
        templateStory(base, 0, i + 100)
          .pages.map((p) => p.text)
          .join("|"),
      ),
    );
    expect(texts.size).toBeGreaterThan(3);
  });

  it("звернення батьків стає присвятою", () => {
    expect(templateStory({ ...base, message: "З днем народження!" }).dedication).toBe("З днем народження!");
  });
});

describe("14 сторінок книжки", () => {
  it("кожен шаблонний сюжет має рівно 12 сторінок історії", async () => {
    const { PLOTS, templateStory } = await import("@/lib/template-story");
    for (const [theme, plots] of Object.entries(PLOTS)) {
      plots.forEach((_, variant) => {
        for (const gender of ["boy", "girl"] as const) {
          for (const age of [3, 7]) {
            const s = templateStory({ childName: "Марко", gender, age, theme: theme as never, trait: "сміливість", friend: "песик Бублик" }, variant);
            expect(s.pages, `${theme} #${variant}`).toHaveLength(12);
            for (const p of s.pages) expect(p.text).not.toMatch(/\{\{|\[\[|undefined/);
          }
        }
      });
    }
  });
});

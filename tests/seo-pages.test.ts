import { describe, expect, it } from "vitest";
import { ALL_TOPICS, findTopic } from "@/lib/catalog";
import { IDEA_TAGS, IDEAS } from "@/lib/pages/ideas";
import { inflect } from "@/lib/pages/inflect";
import { NAMES, nameTexts } from "@/lib/pages/names";
import { THEME_TEXTS, themeSections } from "@/lib/pages/themes";

const SLUG = /^[a-z0-9-]+$/;

describe("сторінки тем", () => {
  it("є текст для кожної теми каталогу", () => {
    const missing = ALL_TOPICS.map((x) => x.topic.id).filter((id) => !THEME_TEXTS.some((t) => t.id === id));
    expect(missing).toEqual([]);
  });
  it("у кожної теми 5 розділів і 5 назв", () => {
    for (const t of THEME_TEXTS) {
      expect(themeSections(t.id)).toHaveLength(5);
      expect(t.titles.length).toBeGreaterThanOrEqual(5);
    }
  });
  it("шаблони з ім'ям розгортаються без залишків дужок", () => {
    for (const t of THEME_TEXTS) {
      for (const text of [t.sample, ...t.titles]) {
        for (const g of ["m", "f"] as const) {
          const out = inflect(text, "Тест", g, "Теста");
          expect(out, `${t.id}: ${text}`).not.toMatch(/[{}|]/);
        }
      }
    }
  });
  it("без прямих лапок усередині текстів", () => {
    for (const t of THEME_TEXTS) expect(t.sample).not.toMatch(/"/);
  });
});

describe("сторінки імен", () => {
  it("адреси унікальні й латиницею", () => {
    const slugs = NAMES.map((n) => n.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const s of slugs) expect(s).toMatch(SLUG);
    expect(NAMES.length).toBeGreaterThan(330);
  });
  it("тексти розгортаються для кожного імені", () => {
    for (const n of NAMES) {
      const t = nameTexts(n);
      for (const p of [t.lead, ...t.paragraphs, t.sample, ...t.titles]) expect(p, n.name).not.toMatch(/[{}|]/);
    }
  });
});

describe("ідеї", () => {
  it("адреси унікальні, теми й категорії існують", () => {
    const slugs = IDEAS.map((i) => i.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    const tags = new Set(IDEA_TAGS.map((t) => t.id));
    for (const i of IDEAS) {
      expect(i.slug).toMatch(SLUG);
      expect(findTopic(i.topic), `${i.slug}: ${i.topic}`).not.toBeNull();
      for (const tag of i.tags) expect(tags.has(tag), `${i.slug}: ${tag}`).toBe(true);
      expect(i.titles.length).toBeGreaterThanOrEqual(5);
    }
  });
  it("у кожній категорії є хоча б одна ідея", () => {
    for (const t of IDEA_TAGS) expect(IDEAS.some((i) => i.tags.includes(t.id)), t.id).toBe(true);
  });
});

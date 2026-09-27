import { describe, expect, it } from "vitest";
import { ALL_TOPICS, CATEGORIES, ILLUSTRATION_STYLES } from "@/lib/catalog";
import { daysWord, nextHoliday } from "@/lib/holidays";
import { ALL_IMAGES, getSlot } from "@/lib/images";
import { makeTemplateStory, requestFromStory } from "@/lib/make-story";
import { composeDedication, friendFrom, themeForTopic, traitForMoral } from "@/lib/story-options";
import { TRAITS } from "@/lib/themes";

describe("каталог", () => {
  it("id тем унікальні", () => {
    const ids = ALL_TOPICS.map((t) => t.topic.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(CATEGORIES).toHaveLength(8);
    expect(ILLUSTRATION_STYLES).toHaveLength(10);
  });

  it("кожна тема має картинку-заглушку з англійським описом", () => {
    for (const { topic } of ALL_TOPICS) {
      const slot = getSlot(`tema/${topic.id}`);
      expect(slot.prompt).not.toMatch(/[а-яіїєґ]/i);
    }
    const ids = ALL_IMAGES.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe("вибір конструктора → шаблон", () => {
  it("кожна тема веде до існуючої пригоди, кожна мораль — до відомої риси", () => {
    for (const { topic } of ALL_TOPICS) expect(["space", "forest", "sea", "dino", "castle", "meadow"]).toContain(themeForTopic(topic.id));
    for (const m of ["druzhba", "smilyvist", "pryroda", "liubov", "napolehlyvist", "dilytysia", "chesnist", "povaha"])
      expect(TRAITS).toContain(traitForMoral(m));
  });

  it("друг із додаткових героїв і присвята", () => {
    expect(friendFrom([{ type: "pet", name: "Бублик", relation: "песик" }])).toBe("песик Бублик");
    expect(friendFrom([{ type: "person", name: "  " }])).toBeUndefined();
    expect(composeDedication("Марійка", { dedicationFrom: "бабуся Марія", occasion: "8-й день народження" })).toBe(
      "Марійка! 8-й день народження — чудовий привід для казки про тебе. З любов'ю, бабуся Марія.",
    );
    expect(composeDedication("Марійка", {})).toBeUndefined();
  });

  it("вибір зберігається в казці й повертається для «Іншого сюжету»", () => {
    const story = makeTemplateStory({
      childName: "Тимко",
      gender: "boy",
      age: 5,
      theme: themeForTopic("dynozavry"),
      trait: traitForMoral("smilyvist"),
      topic: "dynozavry",
      style: "akvarel",
      font: "kazkova",
      characters: [{ type: "pet", name: "Бублик", relation: "песик" }],
    });
    expect(story.theme).toBe("dino");
    expect(story.options).toMatchObject({ topic: "dynozavry", style: "akvarel", font: "kazkova" });
    expect(requestFromStory(story)).toMatchObject({ topic: "dynozavry", childName: "Тимко" });
  });
});

describe("свята", () => {
  it("найближче свято після 28 вересня 2026 — Гелловін за 33 дні", () => {
    const n = nextHoliday(new Date(2026, 8, 28));
    expect(n.holiday.topic).toBe("helovin");
    expect(n.days).toBe(33);
  });

  it("Великдень 2026 — 12 квітня, 2027 — 2 травня", () => {
    expect(nextHoliday(new Date(2026, 3, 1)).holiday.date.toDateString()).toBe(new Date(2026, 3, 12).toDateString());
    const e27 = nextHoliday(new Date(2027, 3, 20));
    expect(e27.holiday.topic).toBe("velykden");
    expect(e27.holiday.date.getDate()).toBe(2);
  });

  it("відмінювання «день»", () => {
    expect([1, 2, 5, 11, 21, 33, 69].map(daysWord)).toEqual(["день", "дні", "днів", "днів", "день", "дні", "днів"]);
  });
});

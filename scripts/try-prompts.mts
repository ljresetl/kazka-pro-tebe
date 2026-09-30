// Пробна казка + повні завдання художнику для листа, обкладинки й сторінок (без малювання; ~0,5 Kč за казку).
//   npx tsx --conditions=react-server scripts/try-prompts.mts <index 0..4> [out.json]
import { readFileSync, writeFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
process.env.AI_PROVIDER = "gemini";
const { aiStory } = await import("../src/lib/ai-story");
const { buildPrompt } = await import("../src/lib/ai-images");
import type { StoryRequest } from "../src/lib/types";

const REQUESTS = [
  { childName: "Тарас", gender: "boy", age: 9, theme: "castle", trait: "чесність", wish: "Пригода взимку, треба знайти загублений ключ від бабусиної скрині",
    characters: [{ type: "person", name: "Бабуся Ганна", relation: "бабуся" }, { type: "pet", name: "Рижик", relation: "котик" }] },
  { childName: "Андрійко", gender: "boy", age: 4, theme: "sea", trait: "дружба", friend: "дельфін Сплеск" },
  { childName: "Оля", gender: "girl", age: 2, theme: "forest", trait: "доброта", friend: "їжачок" },
  // Стрес-тест: 9+, чотири герої батьків, дім → холод надворі → чарівний світ → дім, ранок → ніч, подарунок, транспорт.
  { childName: "Даринка", gender: "girl", age: 9, theme: "castle", trait: "винахідливість", topic: "podorozh-u-chasi", style: "komiks", hobbies: "малювати", food: "млинці",
    wish: "Зимовий ранок, Даринка з родиною їде на санях до старого млина, а там чарівний годинник переносить їх у минуле; треба повернутися додому до вечора",
    characters: [{ type: "person", name: "Тато Андрій", relation: "тато" }, { type: "person", name: "Братик Лесик", relation: "братик", age: 5 }, { type: "pet", name: "Мурчик", relation: "котик" }, { type: "object", name: "Заєць Пухнастик", relation: "улюблена іграшка" }] },
] as StoryRequest[];

const req = REQUESTS[Number(process.argv[2] ?? 0)];
const s = await aiStory(req);
if (process.argv[3]) writeFileSync(process.argv[3], JSON.stringify({ req, ...s }, null, 1));
const base = { style: (req as any).style, topic: (req as any).topic,
  gender: req.gender, age: req.age, heroSeed: 1234, theme: req.theme, title: s.title,
  cast: s.cast?.map((c) => `${c.en || c.name}: ${c.look}`), setting: s.setting, outfit: s.outfit,
  heroLook: "(опис героя з листа персонажів)",
};
console.log("OUTFIT:", s.outfit, "\nCAST:", JSON.stringify(s.cast, null, 1));
console.log("\n===== SHEET =====\n" + buildPrompt({ ...base, heroLook: undefined, kind: "sheet", pageText: s.pages[0].text } as never));
for (const i of [0, 5, 11]) {
  console.log(`\n===== PAGE ${i + 1} =====\nТЕКСТ: ${s.pages[i].text}\n\n` + buildPrompt({ ...base, kind: "page", page: i, pageText: s.pages[i].text, illustration: s.pages[i].illustration } as never, { refA: "sheet", prev: i > 0 }));
}

// Кілька різних пробних казок (лише текст і розкадровка, ~0,5 Kč кожна) → JSON для перевірки.
//   npx tsx --conditions=react-server scripts/try-stories.mts out.json
import { readFileSync, writeFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
process.env.AI_PROVIDER = "gemini";
const { aiStory } = await import("../src/lib/ai-story");
import type { StoryRequest } from "../src/lib/types";

const REQUESTS: StoryRequest[] = [
  { childName: "Марко", gender: "boy", age: 6, theme: "space", trait: "допитливість", friend: "робот Бім", hobbies: "конструктор" },
  { childName: "Оля", gender: "girl", age: 2, theme: "forest", trait: "доброта", friend: "їжачок" },
  { childName: "Тарас", gender: "boy", age: 9, theme: "castle", trait: "чесність", wish: "Пригода взимку, треба знайти загублений ключ від бабусиної скрині",
    characters: [{ type: "person", name: "Бабуся Ганна", relation: "бабуся" }, { type: "pet", name: "Рижик", relation: "котик" }] },
  { childName: "Софійка", gender: "girl", age: 5, theme: "dino", trait: "сміливість", food: "полуниця", wish: "День народження, дарунок для мами" },
  { childName: "Андрійко", gender: "boy", age: 4, theme: "sea", trait: "дружба", friend: "дельфін Сплеск" },
] as StoryRequest[];

const out = [];
for (const req of REQUESTS) {
  try {
    const s = await aiStory(req);
    out.push({ req, ...s });
    console.log("✓", s.title);
  } catch (e) {
    console.log("✗", req.childName, String(e).slice(0, 200));
  }
}
writeFileSync(process.argv[2] ?? "stories.json", JSON.stringify(out, null, 1));

// Пробна казка з поточними правилами (лише текст, без малюнків; ~0,5 Kč).
//   npx tsx --conditions=react-server scripts/try-story.mts
import { readFileSync } from "node:fs";
for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
process.env.AI_PROVIDER = "gemini";
const { aiStory } = await import("../src/lib/ai-story");
const story = await aiStory({
  childName: "Соломія",
  gender: "girl",
  age: 3,
  theme: "meadow",
  trait: "доброта",
  friend: "крабик Лоло",
  hobbies: "м'ячики",
  wish: "Нічна пригода: Соломія допомагає веселій сміттєвій машинці прибрати місто",
});
console.log(`# ${story.title}\n`);
console.log("Атмосфера:", story.setting, "\nПаспорти героїв і предметів:", JSON.stringify(story.cast, null, 1), "\n");
story.pages.forEach((p, i) => console.log(`${i + 1}. (${p.text.length} зн.) ${p.text}\n   [${p.illustration}]\n`));

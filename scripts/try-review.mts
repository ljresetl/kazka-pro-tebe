// Перевірка автоперевірки на збережених картинках: npx tsx --conditions=react-server scripts/try-review.mts <json>
import { readFileSync } from "node:fs";
import { GoogleGenAI } from "@google/genai";
import { review } from "../src/lib/ai-images";

const d = JSON.parse(readFileSync(process.argv[2], "utf8"));
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
for (const i of [0, 1, 11]) {
  const r = { kind: "page", page: i, pageText: "", illustration: d.story.pages[i], setting: d.story.setting, heroLook: d.story.heroLook, cast: d.story.cast, gender: "girl", age: 5, theme: "sea", title: "" } as never;
  console.log(`page ${i + 1}:`, (await review(ai, d[i], r, d[-3])) ?? "OK");
}

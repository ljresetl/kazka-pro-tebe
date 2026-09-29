// Розмальовка від ШІ з готової ілюстрації (платно, ~0,9 Kč на gemini-2.5-flash-image).
//   npx tsx scripts/coloring-ai-test.mts <картинка> <вихід.png> [модель]
import { readFileSync, writeFileSync } from "node:fs";
import { GoogleGenAI, Modality } from "@google/genai";

for (const line of readFileSync(".env.local", "utf8").split(/\r?\n/)) {
  const m = line.match(/^\s*([A-Z_]+)\s*=\s*"?(.*?)"?\s*$/);
  if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
}
const [src, out, model = "gemini-2.5-flash-image"] = process.argv.slice(2);
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const res = await ai.models.generateContent({
  model,
  contents: [
    {
      role: "user",
      parts: [
        {
          text: "Turn this children's book illustration into a clean coloring page for a 3–6 year old: the same scene, characters and composition, drawn only with clean, smooth, closed black outlines of even medium thickness on a pure white background. No shading, no grey, no gradients, no hatching, no colour, no textures, no text. Simplify tiny details into larger areas that are easy to colour.",
        },
        { inlineData: { mimeType: "image/webp", data: readFileSync(src).toString("base64") } },
      ],
    },
  ],
  config: { responseModalities: [Modality.IMAGE], imageConfig: { aspectRatio: "1:1" } },
});
console.log("[usage]", JSON.stringify(res.usageMetadata));
const img = res.candidates?.[0]?.content?.parts?.find((p) => p.inlineData?.data)?.inlineData;
if (!img?.data) throw new Error("немає картинки");
writeFileSync(out, Buffer.from(img.data, "base64"));
console.log("ok", out);

"use client";

import { saveImage } from "./image-store";
import type { Story } from "./types";

type Img = { data: string; mimeType: string };

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) % 1_000_000;
}

type Part = { kind: "cover" | "page"; pageText: string; illustration?: string };

async function draw(story: Story, part: Part, reference?: Img): Promise<Img> {
  const res = await fetch("/api/illustrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      gender: story.gender,
      age: story.age,
      heroSeed: seedFrom(story.id),
      theme: story.theme,
      title: story.title,
      friend: story.friend,
      ...part,
      reference,
    }),
  });
  const data = (await res.json()) as Img & { error?: string };
  if (!res.ok || !data.data) throw new Error(data.error || "Не вдалося намалювати ілюстрацію.");
  return data;
}

/**
 * Малює обкладинку й усі сторінки казки по черзі й зберігає їх у браузері.
 * Обкладинка стає зразком героя для решти картинок.
 */
export async function illustrateStory(story: Story, onProgress: (done: number, total: number) => void) {
  const total = story.pages.length + 1;
  onProgress(0, total);
  const first = story.pages[0];
  const cover = await draw(story, { kind: "cover", pageText: first.text, illustration: first.illustration });
  await saveImage(story.id, -1, cover.data, cover.mimeType);
  onProgress(1, total);

  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i];
    const img = await draw(story, { kind: "page", pageText: page.text, illustration: page.illustration }, cover);
    await saveImage(story.id, i, img.data, img.mimeType);
    onProgress(i + 2, total);
  }
}

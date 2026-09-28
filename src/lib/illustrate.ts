"use client";

import { deletePhoto, loadImage, loadPhoto, saveImage } from "./image-store";
import { findTopic } from "./catalog";
import type { Story } from "./types";

type Img = { data: string; mimeType: string };

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) % 1_000_000;
}

type Part = { kind: "cover" | "page"; pageText: string; illustration?: string; photo?: boolean };

const KIND_EN = { person: "person", pet: "animal", object: "toy or object" } as const;

/** Інші герої для художника: «Bublyk (песик, animal)». */
function companions(story: Story) {
  const list = (story.options?.characters ?? [])
    .filter((c) => c.name.trim())
    .map((c) => `${c.name} (${[c.relation, KIND_EN[c.type], c.age ? `${c.age} years old` : null].filter(Boolean).join(", ")})`);
  return list.length ? list : undefined;
}

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
      style: story.options?.style,
      topic: story.options?.topic && findTopic(story.options.topic) ? story.options.topic : undefined,
      companions: companions(story),
      hasPhoto: part.kind === "cover" && Boolean(reference) && part.photo,
      kind: part.kind,
      pageText: part.pageText,
      illustration: part.illustration,
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
  // Фото дитини (якщо батьки його дали) потрібне лише для обкладинки.
  const photo = await loadPhoto(story.id);
  const cover = await draw(
    story,
    { kind: "cover", pageText: first.text, illustration: first.illustration, photo: Boolean(photo) },
    photo ?? undefined,
  );
  // Обіцяли батькам: фото не зберігаємо довше, ніж потрібно.
  if (photo) await deletePhoto(story.id);
  await saveImage(story.id, -1, cover.data, cover.mimeType);
  onProgress(1, total);

  for (let i = 0; i < story.pages.length; i++) {
    const page = story.pages[i];
    const img = await draw(story, { kind: "page", pageText: page.text, illustration: page.illustration }, cover);
    await saveImage(story.id, i, img.data, img.mimeType);
    onProgress(i + 2, total);
  }
}

/** Перемальовує одну сторінку (обкладинка — зразок героя, щоб він лишався схожим). */
export async function redrawPage(story: Story, index: number) {
  const page = story.pages[index];
  if (!page) return;
  const cover = await loadImage(story.id, -1);
  const img = await draw(story, { kind: "page", pageText: page.text, illustration: page.illustration }, cover ?? undefined);
  await saveImage(story.id, index, img.data, img.mimeType);
}

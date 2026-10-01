"use client";

import { COLORING_BASE, loadImage, saveImage } from "./image-store";
import { shrinkReference } from "./illustrate";
import type { Story } from "./types";

/** Чи можна зробити для цієї книжки розмальовку від ШІ (лише оплачені книжки з ілюстраціями). */
export function canAiColor(story: Story | undefined) {
  return Boolean(story?.paid && story.paidTicket && story.ticket);
}

function toUrl(img: { data: string; mimeType: string }) {
  const bytes = Uint8Array.from(atob(img.data), (c) => c.charCodeAt(0));
  return URL.createObjectURL(new Blob([bytes], { type: img.mimeType }));
}

/**
 * Контури для обкладинки й кожної сторінки: беремо збережені, бракуючі замовляємо в ШІ й зберігаємо
 * (повторний друк — безкоштовний). Повертає адреси картинок за номером: -1 — обкладинка, 0… — сторінки.
 */
export async function aiColoring(story: Story, onProgress: (done: number, total: number) => void): Promise<Map<number, string>> {
  const indexes = [-1, ...story.pages.map((_, i) => i)];
  const result = new Map<number, string>();
  const todo: number[] = [];
  for (const i of indexes) {
    const saved = await loadImage(story.id, COLORING_BASE + 1 + i);
    if (saved) result.set(i, toUrl(saved));
    else todo.push(i);
  }
  let done = result.size;
  onProgress(done, indexes.length);
  for (const i of todo) {
    const original = await loadImage(story.id, i);
    if (!original) {
      onProgress(++done, indexes.length);
      continue;
    }
    const res = await fetch("/api/coloring", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storyId: story.id, ticket: story.ticket, paidTicket: story.paidTicket, age: story.age, image: await shrinkReference(original) }),
    });
    const data = (await res.json().catch(() => ({}))) as { data?: string; mimeType?: string; error?: string };
    if (!res.ok || !data.data || !data.mimeType) throw new Error(data.error || "Не вдалося зробити розмальовку.");
    const img = { data: data.data, mimeType: data.mimeType };
    await saveImage(story.id, COLORING_BASE + 1 + i, img.data, img.mimeType);
    result.set(i, toUrl(img));
    onProgress(++done, indexes.length);
  }
  return result;
}

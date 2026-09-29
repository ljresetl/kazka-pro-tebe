"use client";

import { deletePhoto, loadImage, loadImages, loadPhoto, saveImage } from "./image-store";
import { findTopic } from "./catalog";
import type { Story } from "./types";

type Img = { data: string; mimeType: string };

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) % 1_000_000;
}

type Part = { kind: "cover" | "page"; pageText: string; illustration?: string; photo?: boolean; page?: number };

const KIND_EN = { person: "person", pet: "animal", object: "toy or object" } as const;

/** Інші герої для художника: «Bublyk (песик, animal)». */
function companions(story: Story) {
  const list = (story.options?.characters ?? [])
    .filter((c) => c.name.trim())
    .map((c) => `${c.name} (${[c.relation, KIND_EN[c.type], c.age ? `${c.age} years old` : null].filter(Boolean).join(", ")})`);
  return list.length ? list : undefined;
}

/**
 * Зразок героя (обкладинка чи фото), який надсилається з кожним запитом, стискаємо до ~768 px JPEG:
 * великі PNG (старі казки) не вміщуються в запит, а на мобільному інтернеті ще й довго летять.
 */
async function shrinkReference(img: Img): Promise<Img> {
  if (img.data.length < 700_000 || typeof document === "undefined") return img;
  try {
    const bytes = Uint8Array.from(atob(img.data), (c) => c.charCodeAt(0));
    const bitmap = await createImageBitmap(new Blob([bytes], { type: img.mimeType }));
    const scale = Math.min(1, 768 / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    const url = canvas.toDataURL("image/jpeg", 0.86);
    return { data: url.slice(url.indexOf(",") + 1), mimeType: "image/jpeg" };
  } catch {
    return img;
  }
}

async function draw(story: Story, part: Part, reference?: Img): Promise<Img> {
  if (reference) reference = await shrinkReference(reference);
  const res = await fetch("/api/illustrate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      storyId: story.id,
      ticket: story.ticket ?? "",
      paidTicket: story.paidTicket,
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
      page: part.page,
      pageText: part.pageText,
      illustration: part.illustration,
      reference,
    }),
  });
  const data = (await res.json()) as Img & { error?: string };
  // Ліміт чи потрібна оплата — повтори не допоможуть, зупиняємося одразу.
  if (res.status === 402 || res.status === 403) throw new StopError(data.error || "Ілюстрації зараз недоступні.");
  if (!res.ok || !data.data) throw new Error(data.error || "Не вдалося намалювати ілюстрацію.");
  return data;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Помилка, після якої малювати далі немає сенсу (ліміт, немає оплати). */
class StopError extends Error {}

/** На телефоні запит обривається, коли браузер іде у фон, — чекаємо, поки сторінку знову відкриють. */
function whenVisible() {
  if (typeof document === "undefined" || document.visibilityState === "visible") return Promise.resolve();
  return new Promise<void>((resolve) => {
    const on = () => {
      if (document.visibilityState !== "visible") return;
      document.removeEventListener("visibilitychange", on);
      resolve();
    };
    document.addEventListener("visibilitychange", on);
  });
}

/** Малює з повторами: обірваний зв'язок чи тимчасова помилка сервера не зупиняють усю книжку. */
async function drawWithRetry(story: Story, part: Part, reference?: Img): Promise<Img> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    await whenVisible();
    try {
      return await draw(story, part, reference);
    } catch (err) {
      if (err instanceof StopError) throw err;
      last = err;
      await sleep(2000 * (attempt + 1));
    }
  }
  // «Failed to fetch» — це обрив мережі; батькам пояснюємо по-людськи.
  if (last instanceof TypeError) throw new Error("Немає зв'язку з сервером.");
  throw last;
}

/**
 * Малює обкладинку й сторінки казки по черзі й зберігає їх у браузері.
 * Уже намальовані картинки пропускає, тож повторний запуск лише домальовує пропущене.
 * Обкладинка стає зразком героя для решти картинок.
 * `upTo` — скільки перших сторінок малювати (до оплати — лише безкоштовні, решту після оплати).
 */
export async function illustrateStory(
  story: Story,
  onProgress: (done: number, total: number) => void,
  { redraw = false, upTo = story.pages.length }: { redraw?: boolean; upTo?: number } = {},
) {
  const count = Math.min(upTo, story.pages.length);
  const total = count + 1;
  const have = new Set(
    redraw ? [] : (await loadImages(story.id).catch(() => [])).map((i) => i.index).filter((i) => i < count),
  );
  let done = have.size;
  onProgress(done, total);
  let failed = 0;

  let cover = have.has(-1) ? await loadImage(story.id, -1) : null;
  if (!cover) {
    const first = story.pages[0];
    // Фото дитини (якщо батьки його дали) потрібне лише для обкладинки.
    const photo = await loadPhoto(story.id);
    cover = await drawWithRetry(
      story,
      { kind: "cover", pageText: first.text, illustration: first.illustration, photo: Boolean(photo) },
      photo ?? undefined,
    );
    // Обіцяли батькам: фото не зберігаємо довше, ніж потрібно.
    if (photo) await deletePhoto(story.id);
    await saveImage(story.id, -1, cover.data, cover.mimeType);
    onProgress(++done, total);
  }

  for (let i = 0; i < count; i++) {
    if (have.has(i)) continue;
    const page = story.pages[i];
    try {
      const img = await drawWithRetry(story, { kind: "page", pageText: page.text, illustration: page.illustration, page: i }, cover);
      await saveImage(story.id, i, img.data, img.mimeType);
      onProgress(++done, total);
    } catch (err) {
      if (err instanceof StopError) throw err;
      failed++;
    }
  }
  if (failed) throw new Error(`Не вдалося намалювати ${failed} з ${total} ілюстрацій. Натисніть «Домалювати».`);
}

/** Перемальовує одну сторінку (обкладинка — зразок героя, щоб він лишався схожим). */
export async function redrawPage(story: Story, index: number) {
  const page = story.pages[index];
  if (!page) return;
  const cover = await loadImage(story.id, -1);
  const img = await draw(story, { kind: "page", pageText: page.text, illustration: page.illustration, page: index }, cover ?? undefined);
  await saveImage(story.id, index, img.data, img.mimeType);
}

"use client";

import { deletePhoto, loadImage, loadImages, loadPhoto, saveImage } from "./image-store";
import { readStory, saveStory } from "./storage";
import { findTopic } from "./catalog";
import type { Story } from "./types";

type Img = { data: string; mimeType: string };

function seedFrom(text: string) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
  return (h >>> 0) % 1_000_000;
}

type Part = { kind: "sheet" | "cover" | "page"; pageText: string; illustration?: string; page?: number };
/** Зразок A і його роль: фото дитини, лист персонажів або обкладинка (старі казки без листа). */
type Refs = { a?: Img; aRole?: "photo" | "sheet" | "cover"; b?: Img };

/** Лист персонажів зберігається поруч із малюнками під цим номером (книжці не показується). */
const SHEET = -3;

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
export async function shrinkReference(img: Img): Promise<Img> {
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

async function draw(story: Story, part: Part, refs: Refs = {}): Promise<Img & { heroLook?: string }> {
  const reference = refs.a ? await shrinkReference(refs.a) : undefined;
  const reference2 = refs.b ? await shrinkReference(refs.b) : undefined;
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
      cast: story.cast?.slice(0, 8).map((c) => `${c.name}: ${c.look}`.slice(0, 200)),
      setting: story.setting?.slice(0, 400),
      heroLook: part.kind === "sheet" ? undefined : story.heroLook?.slice(0, 600),
      hasPhoto: refs.aRole === "photo",
      kind: part.kind,
      page: part.page,
      pageText: part.pageText,
      illustration: part.illustration,
      reference,
      refRole: reference ? refs.aRole : undefined,
      reference2,
    }),
  });
  const data = (await res.json()) as Img & { error?: string; heroLook?: string };
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
async function drawWithRetry(story: Story, part: Part, refs: Refs = {}): Promise<Img & { heroLook?: string }> {
  let last: unknown;
  for (let attempt = 0; attempt < 3; attempt++) {
    await whenVisible();
    try {
      return await draw(story, part, refs);
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

/** Запам'ятовує опис героя в казці — для всіх наступних сторінок. */
function rememberHero(story: Story, heroLook: string | undefined): Story {
  if (!heroLook) return story;
  const saved = readStory(story.id);
  if (saved) saveStory({ ...saved, heroLook });
  return { ...story, heroLook };
}

/**
 * Малює книжку по черзі й зберігає малюнки в браузері:
 * 1) лист персонажів (з фото дитини, якщо його дали) — зразок для всіх малюнків;
 * 2) обкладинку; 3) сторінки — зі зразками «лист персонажів» і «попередня сторінка».
 * Уже намальоване пропускає, тож повторний запуск лише домальовує пропущене.
 * `upTo` — скільки перших сторінок малювати (до оплати — лише безкоштовні, решту після оплати).
 * Старі казки (обкладинка є, листа немає) малюють далі за обкладинкою.
 */
export async function illustrateStory(
  story: Story,
  onProgress: (done: number, total: number) => void,
  { redraw = false, upTo = story.pages.length }: { redraw?: boolean; upTo?: number } = {},
) {
  const count = Math.min(upTo, story.pages.length);
  const stored = redraw ? [] : await loadImages(story.id).catch(() => []);
  const have = new Set(stored.map((i) => i.index));
  let sheet = have.has(SHEET) ? await loadImage(story.id, SHEET) : null;
  let cover = have.has(-1) ? await loadImage(story.id, -1) : null;
  const needSheet = !sheet && !cover;
  const total = count + 1 + (needSheet ? 1 : 0);
  let done = [-1, ...Array.from({ length: count }, (_, i) => i)].filter((i) => have.has(i)).length;
  onProgress(done, total);
  let failed = 0;
  const first = story.pages[0];

  if (needSheet) {
    // Фото дитини (якщо батьки його дали) потрібне лише для листа персонажів.
    const photo = await loadPhoto(story.id);
    const drawn = await drawWithRetry(
      story,
      { kind: "sheet", pageText: first.text, illustration: first.illustration },
      photo ? { a: photo, aRole: "photo" } : {},
    );
    // Обіцяли батькам: фото не зберігаємо довше, ніж потрібно.
    if (photo) await deletePhoto(story.id);
    sheet = { data: drawn.data, mimeType: drawn.mimeType };
    await saveImage(story.id, SHEET, sheet.data, sheet.mimeType);
    story = rememberHero(story, drawn.heroLook);
    onProgress(++done, total);
  }

  const main: Refs = sheet ? { a: sheet, aRole: "sheet" } : cover ? { a: cover, aRole: "cover" } : {};

  if (!cover) {
    // Обкладинка — своя сцена (герой у світі казки), а не 1-ша сторінка.
    const drawn = await drawWithRetry(story, { kind: "cover", pageText: first.text }, main);
    cover = { data: drawn.data, mimeType: drawn.mimeType };
    await saveImage(story.id, -1, cover.data, cover.mimeType);
    if (!sheet) story = rememberHero(story, drawn.heroLook);
    onProgress(++done, total);
  }

  const pageRefs: Refs = main.a ? main : { a: cover, aRole: "cover" };
  let prev: Img | null = cover;
  for (let i = 0; i < count; i++) {
    if (have.has(i)) {
      prev = await loadImage(story.id, i);
      continue;
    }
    const page = story.pages[i];
    try {
      const img = await drawWithRetry(
        story,
        { kind: "page", pageText: page.text, illustration: page.illustration, page: i },
        { ...pageRefs, b: prev ?? undefined },
      );
      await saveImage(story.id, i, img.data, img.mimeType);
      prev = { data: img.data, mimeType: img.mimeType };
      onProgress(++done, total);
    } catch (err) {
      if (err instanceof StopError) throw err;
      failed++;
      prev = null;
    }
  }
  if (failed) throw new Error(`Не вдалося намалювати ${failed} з ${total} ілюстрацій. Натисніть «Домалювати».`);
}

/** Перемальовує одну сторінку: зразки — лист персонажів (або обкладинка) і попередня сторінка. */
export async function redrawPage(story: Story, index: number) {
  const page = story.pages[index];
  if (!page) return;
  const sheet = await loadImage(story.id, SHEET);
  const cover = await loadImage(story.id, -1);
  const prev = index > 0 ? await loadImage(story.id, index - 1) : cover;
  const main: Refs = sheet ? { a: sheet, aRole: "sheet" } : cover ? { a: cover, aRole: "cover" } : {};
  const img = await draw(story, { kind: "page", pageText: page.text, illustration: page.illustration, page: index }, { ...main, b: prev ?? undefined });
  await saveImage(story.id, index, img.data, img.mimeType);
}

"use client";

import { useEffect, useState } from "react";
import type { Illustration } from "./types";

// Ілюстрації від ШІ зберігаються в браузері (IndexedDB) — там достатньо місця
// для кількох книжок, на відміну від localStorage.

const DB = "kazkarnia";
const STORE = "illustrations";
const EVENT = "kazka:images";

type Stored = { key: string; storyId: string; index: number; blob: Blob };

function open(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB, 1);
    req.onupgradeneeded = () => {
      const store = req.result.createObjectStore(STORE, { keyPath: "key" });
      store.createIndex("storyId", "storyId");
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Фото дитини від батьків (лише для малювання, потім видаляється). */
const PHOTO = -2;

/** index: -1 — обкладинка, 0… — сторінки. */
export async function saveImage(storyId: string, index: number, base64: string, mimeType: string) {
  const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
  const blob = new Blob([bytes], { type: mimeType });
  const db = await open();
  await new Promise<void>((resolve, reject) => {
    const tx = db.transaction(STORE, "readwrite");
    tx.objectStore(STORE).put({ key: `${storyId}:${index}`, storyId, index, blob } satisfies Stored);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
  window.dispatchEvent(new Event(EVENT));
}

async function loadImages(storyId: string): Promise<Stored[]> {
  const db = await open();
  return new Promise((resolve, reject) => {
    const req = db.transaction(STORE).objectStore(STORE).index("storyId").getAll(storyId);
    req.onsuccess = () => resolve(req.result as Stored[]);
    req.onerror = () => reject(req.error);
  });
}

/** Одна збережена картинка як base64 (напр., обкладинка — зразок героя для перемальовування). */
export async function loadImage(storyId: string, index: number): Promise<{ data: string; mimeType: string } | null> {
  const item = (await loadImages(storyId).catch(() => [])).find((i) => i.index === index);
  if (!item) return null;
  const buf = new Uint8Array(await item.blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { data: btoa(bin), mimeType: item.blob.type || "image/png" };
}

export async function deleteImages(storyId: string) {
  const items = await loadImages(storyId).catch(() => []);
  if (!items.length) return;
  const db = await open();
  const tx = db.transaction(STORE, "readwrite");
  for (const it of items) tx.objectStore(STORE).delete(it.key);
}

// Згенеровані картинки мають пропорції 4:3.
const W = 1024;
const H = 768;

/** Ілюстрації казки: { cover, pages[index] } як посилання blob:. */
export function useStoryImages(storyId: string) {
  const [images, setImages] = useState<{ cover?: Illustration; pages: (Illustration | undefined)[] }>({ pages: [] });

  useEffect(() => {
    let urls: string[] = [];
    let alive = true;
    const load = () =>
      loadImages(storyId)
        .then((items) => {
          if (!alive) return;
          urls.forEach(URL.revokeObjectURL);
          urls = [];
          const next: { cover?: Illustration; pages: (Illustration | undefined)[] } = { pages: [] };
          for (const it of items) {
            const src = URL.createObjectURL(it.blob);
            urls.push(src);
            const ill = { src, width: W, height: H };
            if (it.index === PHOTO) continue;
            if (it.index === -1) next.cover = ill;
            else next.pages[it.index] = ill;
          }
          setImages(next);
        })
        .catch(() => {});
    load();
    window.addEventListener(EVENT, load);
    return () => {
      alive = false;
      window.removeEventListener(EVENT, load);
      urls.forEach(URL.revokeObjectURL);
    };
  }, [storyId]);

  return images;
}

/** Зменшує фото до 1024 px (JPEG) — так воно легке й придатне для генератора. */
export async function shrinkPhoto(file: File): Promise<{ data: string; mimeType: string; preview: string }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1024 / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const preview = canvas.toDataURL("image/jpeg", 0.85);
  return { data: preview.split(",")[1], mimeType: "image/jpeg", preview };
}

export async function savePhoto(storyId: string, data: string, mimeType: string) {
  await saveImage(storyId, PHOTO, data, mimeType);
}

/** Фото героя в base64, якщо батьки його завантажили. */
export async function loadPhoto(storyId: string): Promise<{ data: string; mimeType: string } | null> {
  const item = (await loadImages(storyId).catch(() => [])).find((it) => it.index === PHOTO);
  if (!item) return null;
  const buf = new Uint8Array(await item.blob.arrayBuffer());
  let bin = "";
  for (let i = 0; i < buf.length; i += 0x8000) bin += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return { data: btoa(bin), mimeType: item.blob.type || "image/jpeg" };
}

export async function deletePhoto(storyId: string) {
  const db = await open();
  const tx = db.transaction(STORE, "readwrite");
  tx.objectStore(STORE).delete(`${storyId}:${PHOTO}`);
}

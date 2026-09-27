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

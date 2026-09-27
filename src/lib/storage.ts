"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Order, Story } from "./types";

// Поки немає бекенду й акаунтів, казки й замовлення зберігаються в браузері покупця.

const STORY_KEY = (id: string) => `kazka:story:${id}`;
const STORY_IDS = "kazka:ids";
const ORDERS = "kazka:orders";
const EVENT = "kazka:storage";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

function write(key: string, value: string) {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // Приватний режим або переповнене сховище — дані просто не збережуться.
  }
}

function parse<T>(raw: string | null | undefined, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function notify() {
  window.dispatchEvent(new Event(EVENT));
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** Сире значення з localStorage: undefined на сервері, "" якщо порожньо. */
function useRaw(key: string): string | undefined {
  return useSyncExternalStore(
    subscribe,
    () => read(key) ?? "",
    () => undefined,
  );
}

/* ---------- Казки ---------- */

export function saveStory(story: Story) {
  write(STORY_KEY(story.id), JSON.stringify(story));
  const ids = parse<string[]>(read(STORY_IDS), []).filter((i) => i !== story.id);
  write(STORY_IDS, JSON.stringify([story.id, ...ids].slice(0, 50)));
  notify();
}

export function deleteStory(id: string) {
  try {
    window.localStorage.removeItem(STORY_KEY(id));
  } catch {}
  write(STORY_IDS, JSON.stringify(parse<string[]>(read(STORY_IDS), []).filter((i) => i !== id)));
  notify();
}

/** undefined — ще не прочитали (сервер), null — казки немає. */
export function useStory(id: string): Story | null | undefined {
  const raw = useRaw(STORY_KEY(id));
  return useMemo(() => (raw === undefined ? undefined : parse<Story | null>(raw, null)), [raw]);
}

function readAllStories(): string {
  const ids = parse<string[]>(read(STORY_IDS), []);
  return "[" + ids.map((id) => read(STORY_KEY(id)) ?? "null").join(",") + "]";
}

/** Усі казки, створені в цьому браузері, від нових до старих. */
export function useStories(): Story[] | undefined {
  // Рядок-знімок усіх казок: змінюється, коли змінюється будь-яка казка.
  const raw = useSyncExternalStore(subscribe, readAllStories, () => undefined);
  return useMemo(
    () => (raw === undefined ? undefined : parse<(Story | null)[]>(raw, []).filter((s): s is Story => s !== null)),
    [raw],
  );
}

/* ---------- Замовлення ---------- */

export function saveOrder(order: Order) {
  const orders = parse<Order[]>(read(ORDERS), []).filter((o) => o.id !== order.id);
  write(ORDERS, JSON.stringify([order, ...orders].slice(0, 50)));
  notify();
}

export function useOrders(): Order[] | undefined {
  const raw = useRaw(ORDERS);
  return useMemo(() => (raw === undefined ? undefined : parse<Order[]>(raw, [])), [raw]);
}

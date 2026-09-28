"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { CartLine } from "./cart";
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

/** Казка зі сховища (поза React). */
export function readStory(id: string): Story | null {
  return parse<Story | null>(read(STORY_KEY(id)), null);
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

/* ---------- Кошик ---------- */

const CART = "kazka:cart";

export function readCart(): CartLine[] {
  return parse<CartLine[]>(read(CART), []);
}

export function useCart(): CartLine[] | undefined {
  const raw = useRaw(CART);
  return useMemo(() => (raw === undefined ? undefined : parse<CartLine[]>(raw, [])), [raw]);
}

function writeCart(lines: CartLine[]) {
  write(CART, JSON.stringify(lines));
  notify();
}

/** Додає рядок; якщо такий уже є — збільшує кількість (е-книга завжди одна). */
export function addToCart(line: Omit<CartLine, "key" | "qty"> & { qty?: number }) {
  const key = [line.storyId, line.kind, line.extraId ?? "", line.cover ?? ""].join(":");
  const lines = readCart();
  const found = lines.find((l) => l.key === key);
  if (found) {
    if (line.kind !== "ebook") found.qty = Math.min(20, found.qty + (line.qty ?? 1));
    found.ebookPaid = line.ebookPaid;
  } else {
    lines.push({ ...line, key, qty: line.qty ?? 1 });
  }
  writeCart(lines);
}

export function setCartQty(key: string, qty: number) {
  writeCart(readCart().map((l) => (l.key === key ? { ...l, qty: Math.max(1, Math.min(20, qty)) } : l)));
}

export function removeFromCart(key: string) {
  writeCart(readCart().filter((l) => l.key !== key));
}

export function clearCart() {
  writeCart([]);
}

/* ---------- «Запроси друга» ---------- */

const REF = "kazka:ref";
const MY_CODE = "kazka:mycode";

/** Код друга, за посиланням якого прийшов покупець. */
export function useReferral(): string | undefined {
  const raw = useRaw(REF);
  const mine = useRaw(MY_CODE);
  // Власний код не діє на себе.
  return raw && raw !== mine ? raw : undefined;
}

export function saveReferral(code: string) {
  write(REF, code);
  notify();
}

/** Власний код-подарунок покупця (створюється один раз). */
export function useMyCode(): string | undefined {
  const raw = useRaw(MY_CODE);
  return raw || undefined;
}

export function ensureMyCode(): string {
  const existing = read(MY_CODE);
  if (existing) return existing;
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  for (const b of bytes) code += alphabet[b % alphabet.length];
  write(MY_CODE, code);
  notify();
  return code;
}

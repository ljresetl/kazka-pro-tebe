import "server-only";
import { createHmac, timingSafeEqual } from "node:crypto";
import { FREE_PAGES } from "./features";

// Ліміти, які бережуть гроші на ШІ:
// - з однієї IP-адреси за 24 години — одна безкоштовна казка; кожна покупка дає ще одну;
// - до оплати сервер малює лише обкладинку й FREE_PAGES сторінок (плюс пару повторів),
//   після оплати — всю книжку й перемальовування.
//
// Лічильники живуть в Upstash Redis (Vercel → Storage). Змінні середовища:
// KV_REST_API_URL + KV_REST_API_TOKEN або UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
// Без них — у пам'яті сервера (для розробки; на Vercel такі лічильники ненадійні).

const DAY = 24 * 60 * 60;
const MONTH = 30 * DAY;
/** Скільки казок на добу без покупки. */
export const FREE_STORIES_PER_DAY = 1;
/** Картинок до оплати: обкладинка + FREE_PAGES сторінок + 2 повтори на обрив зв'язку. */
const IMAGES_BEFORE_PAYMENT = 1 + FREE_PAGES + 2;
/** Картинок після оплати: вся книжка й перемальовування. */
const IMAGES_AFTER_PAYMENT = 40;

const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;

export function quotaStoreConfigured() {
  return Boolean(url && token);
}

// --- Сховище: Redis через REST або пам'ять ---

const memory = new Map<string, { value: number; expires: number }>();

async function redis(command: (string | number)[]): Promise<unknown> {
  const res = await fetch(url!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
    cache: "no-store",
  });
  const data = (await res.json()) as { result?: unknown; error?: string };
  if (!res.ok || data.error) throw new Error(`Redis: ${data.error ?? res.status}`);
  return data.result;
}

async function get(key: string): Promise<number> {
  if (!quotaStoreConfigured()) {
    const item = memory.get(key);
    return item && item.expires > Date.now() ? item.value : 0;
  }
  return Number((await redis(["GET", key])) ?? 0);
}

/** Збільшує лічильник; строк життя ставиться лише при першому записі. */
async function incr(key: string, ttl: number): Promise<number> {
  if (!quotaStoreConfigured()) {
    const now = Date.now();
    const item = memory.get(key);
    const next = item && item.expires > now ? { ...item, value: item.value + 1 } : { value: 1, expires: now + ttl * 1000 };
    memory.set(key, next);
    return next.value;
  }
  const value = Number(await redis(["INCR", key]));
  if (value === 1) await redis(["EXPIRE", key, ttl]);
  return value;
}

async function set(key: string, ttl: number) {
  if (!quotaStoreConfigured()) {
    memory.set(key, { value: 1, expires: Date.now() + ttl * 1000 });
    return;
  }
  await redis(["SET", key, 1, "EX", ttl]);
}

// --- IP та підпис казки ---

export function clientIp(request: Request) {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
}

const SECRET = process.env.QUOTA_SECRET || process.env.GEMINI_API_KEY || "dev-secret";

/** Підпис казки: без нього сервер не малює (казку мав створити саме наш сервер). */
export function storyTicket(storyId: string) {
  return createHmac("sha256", SECRET).update(`story:${storyId}`).digest("base64url").slice(0, 32);
}

export function validTicket(storyId: string, ticket: string | undefined) {
  if (!ticket) return false;
  const a = Buffer.from(storyTicket(storyId));
  const b = Buffer.from(ticket);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Підпис оплати: зберігається в самій казці (у браузері покупця) й надсилається з кожним запитом.
 * Так оплата не губиться, навіть якщо сервер перезапустився чи бази даних немає.
 */
export function paidTicket(storyId: string) {
  return createHmac("sha256", SECRET).update(`paid:${storyId}`).digest("base64url").slice(0, 32);
}

function validPaidTicket(storyId: string, ticket: string | undefined) {
  if (!ticket) return false;
  const a = Buffer.from(paidTicket(storyId));
  const b = Buffer.from(ticket);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** Підписи оплати для казок замовлення (браузер збереже їх у казках). */
export function paidTickets(storyIds: string[]) {
  return Object.fromEntries(storyIds.map((id) => [id, paidTicket(id)]));
}

// --- Правила ---

const usedKey = (ip: string) => `q:stories:${ip}`;
const boughtKey = (ip: string) => `q:bought:${ip}`;

/** Скільки казок ще можна створити з цієї адреси сьогодні. */
export async function storiesLeft(ip: string) {
  const [used, bought] = await Promise.all([get(usedKey(ip)), get(boughtKey(ip))]);
  return Math.max(0, FREE_STORIES_PER_DAY + bought - used);
}

/** Записує нову казку; false — ліміт вичерпано. */
export async function takeStory(ip: string) {
  if ((await storiesLeft(ip)) <= 0) return false;
  await incr(usedKey(ip), DAY);
  return true;
}

/** Оплату отримано: казки відкриваються для повного малювання, адреса отримує ще одну казку. */
export async function markPaid(storyIds: string[], ip?: string) {
  await Promise.all(storyIds.map((id) => set(`q:paid:${id}`, MONTH)));
  if (ip) await incr(boughtKey(ip), DAY);
}

/** Чи можна намалювати ще одну картинку до цієї казки. */
export async function takeImage(storyId: string, ticket?: string) {
  const [flag, drawn] = await Promise.all([get(`q:paid:${storyId}`), get(`q:images:${storyId}`)]);
  const paid = validPaidTicket(storyId, ticket) || Boolean(flag);
  const limit = paid ? IMAGES_AFTER_PAYMENT : IMAGES_BEFORE_PAYMENT;
  if (drawn >= limit) return { ok: false as const, paid: Boolean(paid) };
  await incr(`q:images:${storyId}`, MONTH);
  return { ok: true as const, paid: Boolean(paid) };
}

/** Розмальовка (контури від ШІ) — лише для оплачених книжок і не більше 30 сторінок на книжку. */
export async function takeColoring(storyId: string, ticket?: string) {
  if (!validPaidTicket(storyId, ticket)) return { ok: false as const, reason: "unpaid" as const };
  if ((await get(`q:coloring:${storyId}`)) >= 30) return { ok: false as const, reason: "limit" as const };
  await incr(`q:coloring:${storyId}`, MONTH);
  return { ok: true as const };
}

// Замовлення LiqPay: між створенням платежу й підтвердженням пам'ятаємо, які казки й з якої адреси.
export async function rememberOrder(orderId: string, storyIds: string[], ip: string) {
  if (!quotaStoreConfigured()) {
    orders.set(orderId, { storyIds, ip });
    return;
  }
  await redis(["SET", `q:order:${orderId}`, JSON.stringify({ storyIds, ip }), "EX", MONTH]);
}

const orders = new Map<string, { storyIds: string[]; ip: string }>();

/** Позначає замовлення оплаченим один раз (повторні сповіщення LiqPay ігноруються). */
export async function settleOrder(orderId: string) {
  let order: { storyIds: string[]; ip: string } | undefined;
  if (!quotaStoreConfigured()) {
    order = orders.get(orderId);
    orders.delete(orderId);
  } else {
    const raw = (await redis(["GETDEL", `q:order:${orderId}`])) as string | null;
    order = raw ? JSON.parse(raw) : undefined;
  }
  if (order) await markPaid(order.storyIds, order.ip);
}

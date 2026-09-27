import "server-only";
import crypto from "node:crypto";

// Інтеграція з LiqPay (API v3). Лише для сервера: приватний ключ
// ніколи не потрапляє в браузер.
//
// Змінні середовища:
//   LIQPAY_PUBLIC_KEY, LIQPAY_PRIVATE_KEY — з кабінету LiqPay (Налаштування → API)
//   LIQPAY_SANDBOX=1                      — тестові платежі без списання грошей
//
// Документація: https://www.liqpay.ua/documentation/api/aquiring/checkout/doc

const PUBLIC_KEY = process.env.LIQPAY_PUBLIC_KEY ?? "";
const PRIVATE_KEY = process.env.LIQPAY_PRIVATE_KEY ?? "";

export function liqpayConfigured() {
  return Boolean(PUBLIC_KEY && PRIVATE_KEY);
}

function encode(params: Record<string, unknown>) {
  return Buffer.from(JSON.stringify(params)).toString("base64");
}

function sign(data: string) {
  return crypto.createHash("sha1").update(PRIVATE_KEY + data + PRIVATE_KEY).digest("base64");
}

/** Перевіряє підпис запиту від LiqPay (зворотний виклик). */
export function verifySignature(data: string, signature: string) {
  const expected = Buffer.from(sign(data));
  const given = Buffer.from(signature);
  return expected.length === given.length && crypto.timingSafeEqual(expected, given);
}

export function decodeData<T = Record<string, unknown>>(data: string): T {
  return JSON.parse(Buffer.from(data, "base64").toString("utf8")) as T;
}

type CheckoutInput = {
  orderId: string;
  amount: number;
  description: string;
  resultUrl: string;
  serverUrl: string;
};

/** Посилання на сторінку оплати LiqPay. */
export function checkoutUrl({ orderId, amount, description, resultUrl, serverUrl }: CheckoutInput) {
  const data = encode({
    version: 3,
    public_key: PUBLIC_KEY,
    action: "pay",
    amount,
    currency: "UAH",
    description,
    order_id: orderId,
    result_url: resultUrl,
    server_url: serverUrl,
    language: "uk",
    ...(process.env.LIQPAY_SANDBOX === "1" ? { sandbox: 1 } : {}),
  });
  const params = new URLSearchParams({ data, signature: sign(data) });
  return `https://www.liqpay.ua/api/3/checkout?${params}`;
}

/** Статус платежу за номером замовлення: "success", "sandbox", "failure", "processing"… */
export async function paymentStatus(orderId: string): Promise<string> {
  const data = encode({ version: 3, public_key: PUBLIC_KEY, action: "status", order_id: orderId });
  const res = await fetch("https://www.liqpay.ua/api/request", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ data, signature: sign(data) }),
    cache: "no-store",
  });
  if (!res.ok) return "error";
  const json = (await res.json()) as { status?: string };
  return json.status ?? "error";
}

export const PAID_STATUSES = new Set(["success", "sandbox"]);

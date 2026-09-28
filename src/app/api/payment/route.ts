import { z } from "zod";
import { lineName, priceCart, REFERRAL_RE, type CartLine } from "@/lib/cart";
import { checkoutUrl, liqpayConfigured, PAID_STATUSES, paymentStatus } from "@/lib/liqpay";
import { SITE } from "@/lib/site";

// Створює платіж і повертає посилання на сторінку оплати LiqPay.
// Суму рахує сервер за тими самими правилами, що й кошик, — підмінити її в браузері не можна.

const ORDER_ID = /^K-[A-Z0-9]+$/;

const LineSchema = z.object({
  key: z.string().max(80),
  storyId: z.string().max(20),
  storyTitle: z.string().max(120),
  kind: z.enum(["ebook", "hardcover", "extra"]),
  extraId: z.string().max(20).optional(),
  cover: z.enum(["matova", "hlyantseva"]).optional(),
  qty: z.number().int().min(1).max(20),
  ebookPaid: z.boolean().optional(),
  paidOrder: z.string().regex(ORDER_ID).optional(),
});

const OrderSchema = z.object({
  id: z.string().regex(ORDER_ID),
  items: z.array(LineSchema).min(1).max(30),
  referral: z.string().regex(REFERRAL_RE).optional(),
  contact: z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20),
  }),
  delivery: z.object({ city: z.string().trim().max(80), branch: z.string().trim().max(80) }).optional(),
  comment: z.string().max(300).optional(),
});

/** Знижку «е-книгу вже оплачено» даємо лише, якщо LiqPay підтверджує попереднє замовлення. */
async function verifyPaid(items: CartLine[]): Promise<CartLine[]> {
  const cache = new Map<string, boolean>();
  const out: CartLine[] = [];
  for (const l of items) {
    let ok = false;
    if (l.ebookPaid && l.paidOrder) {
      if (!cache.has(l.paidOrder)) cache.set(l.paidOrder, PAID_STATUSES.has(await paymentStatus(l.paidOrder)));
      ok = cache.get(l.paidOrder)!;
    }
    out.push({ ...l, ebookPaid: ok });
  }
  return out;
}

export async function POST(request: Request) {
  if (!liqpayConfigured()) {
    return Response.json({ error: "Оплата ще не налаштована." }, { status: 503 });
  }
  const parsed = OrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Перевірте дані замовлення." }, { status: 400 });
  const order = parsed.data;

  const items = await verifyPaid(order.items);
  const totals = priceCart(items, order.referral);
  if (totals.total <= 0) return Response.json({ error: "Кошик порожній." }, { status: 400 });
  if (totals.needsDelivery && !order.delivery) return Response.json({ error: "Вкажіть доставку." }, { status: 400 });
  const origin = new URL(request.url).origin;

  // Бази даних поки немає, тож усі деталі замовлення зберігаються в описі платежу:
  // продавець бачить їх у кабінеті LiqPay.
  const details = [
    totals.lines
      .map((l) => `${lineName(l)}${l.cover ? ` (${l.cover === "matova" ? "матова" : "глянцева"})` : ""} ×${l.qty}: «${l.storyTitle}» [${l.storyId}]`)
      .join("; "),
    `${order.contact.name}, ${order.contact.email}${order.contact.phone ? `, ${order.contact.phone}` : ""}`,
    order.delivery ? `НП: ${order.delivery.city}, ${order.delivery.branch}` : null,
    order.referral ? `Код друга ${order.referral}` : null,
    order.comment ?? null,
  ]
    .filter(Boolean)
    .join(" | ");

  const url = checkoutUrl({
    orderId: order.id,
    amount: totals.total,
    description: `${SITE.name}. ${details}`.slice(0, 480),
    resultUrl: `${origin}/kazka/oplata/rezultat?order=${order.id}`,
    serverUrl: `${origin}/api/payment/callback`,
  });
  return Response.json({ url });
}

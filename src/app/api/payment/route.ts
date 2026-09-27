import { z } from "zod";
import { checkoutUrl, liqpayConfigured } from "@/lib/liqpay";
import { getPrice } from "@/lib/prices";
import { SITE } from "@/lib/site";

// Створює платіж і повертає посилання на сторінку оплати LiqPay.

const OrderSchema = z.object({
  id: z.string().regex(/^K-[A-Z0-9]+$/),
  storyId: z.string().max(20),
  storyTitle: z.string().max(120),
  product: z.enum(["pdf", "pdf-coloring", "print"]),
  contact: z.object({
    name: z.string().trim().min(1).max(80),
    email: z.string().trim().email().max(120),
    phone: z.string().trim().max(20),
  }),
  delivery: z.object({ city: z.string().trim().max(80), branch: z.string().trim().max(80) }).optional(),
  comment: z.string().max(300).optional(),
});

export async function POST(request: Request) {
  if (!liqpayConfigured()) {
    return Response.json({ error: "Оплата ще не налаштована." }, { status: 503 });
  }
  const parsed = OrderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Перевірте дані замовлення." }, { status: 400 });
  const order = parsed.data;

  // Ціну беремо з сервера, а не з браузера: так її не можна підмінити.
  const price = getPrice(order.product);
  const origin = new URL(request.url).origin;

  // Бази даних поки немає, тож усі деталі замовлення зберігаються в описі платежу:
  // продавець бачить їх у кабінеті LiqPay.
  const details = [
    `${price.name}: «${order.storyTitle}»`,
    `${order.contact.name}, ${order.contact.email}${order.contact.phone ? `, ${order.contact.phone}` : ""}`,
    order.delivery ? `НП: ${order.delivery.city}, ${order.delivery.branch}` : null,
    order.comment ?? null,
    `Казка ${order.storyId}`,
  ]
    .filter(Boolean)
    .join(" | ");

  const url = checkoutUrl({
    orderId: order.id,
    amount: price.amount,
    description: `${SITE.name}. ${details}`.slice(0, 480),
    resultUrl: `${origin}/kazka/oplata/rezultat?order=${order.id}`,
    serverUrl: `${origin}/api/payment/callback`,
  });
  return Response.json({ url });
}

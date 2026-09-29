import { z } from "zod";
import { clientIp, markPaid, paidTickets } from "@/lib/quota";

// Тестовий режим оплати (NEXT_PUBLIC_PAYMENT_MODE не "live"): гроші не списуються,
// але сервер так само відкриває казки для повного малювання й дає ще одну казку.
// У бойовому режимі цей маршрут вимкнений — оплату підтверджує лише LiqPay.
const Schema = z.object({ storyIds: z.array(z.string().max(40)).min(1).max(30) });

export async function POST(request: Request) {
  if (process.env.NEXT_PUBLIC_PAYMENT_MODE === "live") return Response.json({ error: "Недоступно." }, { status: 404 });
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Неправильний запит." }, { status: 400 });
  const storyIds = [...new Set(parsed.data.storyIds)];
  await markPaid(storyIds, clientIp(request));
  return Response.json({ ok: true, tickets: paidTickets(storyIds) });
}

import { liqpayConfigured, PAID_STATUSES, paymentDetails } from "@/lib/liqpay";
import { paidTickets, settleOrder } from "@/lib/quota";

// Браузер питає, чи оплачено замовлення, коли покупець повертається з LiqPay.
// Відповідь береться напряму з LiqPay, тож її не можна підробити в браузері.
export async function GET(request: Request) {
  const order = new URL(request.url).searchParams.get("order") ?? "";
  if (!/^K-[A-Z0-9]+$/.test(order) || !liqpayConfigured()) {
    return Response.json({ paid: false, status: "unknown" }, { status: 400 });
  }
  const { status, description } = await paymentDetails(order);
  const paid = PAID_STATUSES.has(status);
  if (!paid) return Response.json({ paid, status });
  // Сповіщення LiqPay може запізнитися — тож відкриваємо казки й тут (лише один раз).
  await settleOrder(order);
  // Номери казок беремо з опису платежу, який підписав LiqPay, — підставити чужі не вийде.
  const storyIds = [...description.matchAll(/\[([A-Za-z0-9_-]{1,40})\]/g)].map((m) => m[1]);
  return Response.json({ paid, status, tickets: paidTickets(storyIds) });
}

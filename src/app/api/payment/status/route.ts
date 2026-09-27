import { liqpayConfigured, PAID_STATUSES, paymentStatus } from "@/lib/liqpay";

// Браузер питає, чи оплачено замовлення, коли покупець повертається з LiqPay.
// Відповідь береться напряму з LiqPay, тож її не можна підробити в браузері.
export async function GET(request: Request) {
  const order = new URL(request.url).searchParams.get("order") ?? "";
  if (!/^K-[A-Z0-9]+$/.test(order) || !liqpayConfigured()) {
    return Response.json({ paid: false, status: "unknown" }, { status: 400 });
  }
  const status = await paymentStatus(order);
  return Response.json({ paid: PAID_STATUSES.has(status), status });
}

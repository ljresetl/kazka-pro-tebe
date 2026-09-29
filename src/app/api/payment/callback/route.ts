import { decodeData, PAID_STATUSES, verifySignature } from "@/lib/liqpay";
import { settleOrder } from "@/lib/quota";

// LiqPay надсилає сюди результат кожного платежу (server_url).
// Підпис перевіряється, тож підробити повідомлення не вийде.
export async function POST(request: Request) {
  const form = await request.formData();
  const data = String(form.get("data") ?? "");
  const signature = String(form.get("signature") ?? "");
  if (!data || !verifySignature(data, signature)) {
    return new Response("bad signature", { status: 400 });
  }
  const payment = decodeData<{ order_id?: string; status?: string; amount?: number; description?: string }>(data);
  if (payment.status && PAID_STATUSES.has(payment.status)) {
    // TODO(після запуску): надіслати покупцеві лист із посиланням на казку
    // і повідомлення продавцю про друковане замовлення (напр., через Resend або Telegram-бота).
    if (payment.order_id) await settleOrder(payment.order_id);
    console.log(`Оплачено замовлення ${payment.order_id}: ${payment.amount} грн. ${payment.description ?? ""}`);
  }
  return new Response("ok");
}

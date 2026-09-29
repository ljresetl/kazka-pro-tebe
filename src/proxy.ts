import { NextResponse, type NextRequest } from "next/server";
import { isBlockedAgent } from "@/lib/bots";

// ШІ-збирачам і програмам-скраперам сторінки й картинки не віддаємо (403).
// Пошуковики й звичайні браузери проходять. robots.txt лишаємо відкритим —
// там ці ж боти отримують чемну заборону.
export function proxy(request: NextRequest) {
  // Локальний запуск: оптимізатор картинок звертається до сервера сам, без браузерного User-Agent.
  // На Vercel хост ніколи не localhost, тож там перевірка діє завжди.
  const internal = /^(localhost|127\.0\.0\.1|\[::1\])(:|$)/.test(request.nextUrl.host);
  if (!internal && isBlockedAgent(request.headers.get("user-agent"))) {
    return new NextResponse("Доступ для автоматичних програм закрито.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
  return NextResponse.next();
}

export const config = {
  // Підтвердження оплати LiqPay приходить від їхнього сервера — його не чіпаємо.
  matcher: ["/((?!_next/static|api/payment/callback|robots.txt|favicon.ico|icon.svg|apple-icon.png).*)"],
};

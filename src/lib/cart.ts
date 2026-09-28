// Кошик і розрахунок суми — однаковий у браузері й на сервері (сервер перераховує сам).
// Правила як на зразку:
//   • е-книга — EBOOK; друкована у твердій обкладинці — HARDCOVER, оплачена е-книга зараховується;
//   • кожна третя друкована книжка — зі знижкою THIRD_BOOK_DISCOUNT %;
//   • додатки до книжки — зі знижкою EXTRAS_DISCOUNT %;
//   • доставка безкоштовна від FREE_SHIPPING_FROM друкованих книжок, інакше SHIPPING;
//   • код друга («Запроси друга») — знижка REFERRAL_DISCOUNT % на е-книги.
import { EBOOK, EXTRAS, FREE_SHIPPING_FROM, HARDCOVER, SHIPPING, THIRD_BOOK_DISCOUNT, withDiscount } from "./offer";

export const REFERRAL_DISCOUNT = 20;
export const REFERRAL_RE = /^[A-Z0-9]{6}$/;

export type CartKind = "ebook" | "hardcover" | "extra";
export type CoverFinish = "matova" | "hlyantseva";

export type CartLine = {
  /** Унікальний ключ рядка в кошику. */
  key: string;
  storyId: string;
  storyTitle: string;
  kind: CartKind;
  /** Для додатків — id з EXTRAS. */
  extraId?: string;
  cover?: CoverFinish;
  qty: number;
  /** Е-книгу вже оплачено (тоді друк дешевший на її ціну). */
  ebookPaid?: boolean;
  /** Замовлення, яким оплачено е-книгу, — сервер перевіряє його в LiqPay. */
  paidOrder?: string;
};

export type PricedLine = CartLine & { name: string; unit: number; total: number; note?: string };

export type CartTotals = {
  lines: PricedLine[];
  subtotal: number;
  discounts: { label: string; amount: number }[];
  shipping: number;
  needsDelivery: boolean;
  total: number;
};

export function lineName(l: Pick<CartLine, "kind" | "extraId">) {
  if (l.kind === "ebook") return "Е-книга";
  if (l.kind === "hardcover") return "Книжка у твердій обкладинці";
  return EXTRAS.find((e) => e.id === l.extraId)?.name ?? "Додаток";
}

/** Рахує суму кошика. `referral` — дійсний код друга. */
export function priceCart(input: CartLine[], referral?: string | null): CartTotals {
  const lines: PricedLine[] = [];
  const discounts: { label: string; amount: number }[] = [];
  // Е-книга не потрібна окремо, якщо ця ж історія вже є в кошику в друкованому вигляді.
  const hardcoverStories = new Set(input.filter((l) => l.kind === "hardcover").map((l) => l.storyId));

  for (const l of input) {
    const qty = Math.max(1, Math.min(20, Math.floor(l.qty || 1)));
    if (l.kind === "ebook") {
      if (hardcoverStories.has(l.storyId) || l.ebookPaid) continue;
      lines.push({ ...l, qty: 1, name: lineName(l), unit: EBOOK, total: EBOOK });
    } else if (l.kind === "hardcover") {
      // Перший примірник: е-книга вже оплачена — доплачуєте різницю; інакше повна ціна (е-книга входить).
      const first = HARDCOVER - (l.ebookPaid ? EBOOK : 0);
      const total = first + (qty - 1) * HARDCOVER;
      lines.push({
        ...l,
        qty,
        name: lineName(l),
        unit: HARDCOVER,
        total,
        note: l.ebookPaid ? "Оплачена е-книга зарахована" : "Е-книга входить у ціну",
      });
    } else {
      const extra = EXTRAS.find((e) => e.id === l.extraId);
      if (!extra) continue;
      const unit = withDiscount(extra.price);
      lines.push({ ...l, qty, name: extra.name, unit, total: unit * qty, note: "Знижка на додатки" });
    }
  }

  const subtotal = lines.reduce((s, l) => s + l.total, 0);

  // Кожна третя друкована книжка — зі знижкою.
  const hardcovers = lines.filter((l) => l.kind === "hardcover").reduce((n, l) => n + l.qty, 0);
  const thirds = Math.floor(hardcovers / 3);
  if (thirds > 0) {
    discounts.push({
      label: `−${THIRD_BOOK_DISCOUNT}% на кожну 3-тю книжку`,
      amount: Math.round((HARDCOVER * THIRD_BOOK_DISCOUNT) / 100) * thirds,
    });
  }

  if (referral && REFERRAL_RE.test(referral)) {
    const ebooks = lines.filter((l) => l.kind === "ebook").length;
    if (ebooks > 0) {
      discounts.push({ label: `Код друга: −${REFERRAL_DISCOUNT}% на е-книгу`, amount: Math.round((EBOOK * REFERRAL_DISCOUNT) / 100) * ebooks });
    }
  }

  const needsDelivery = lines.some((l) => l.kind !== "ebook");
  const shipping = needsDelivery && hardcovers < FREE_SHIPPING_FROM ? SHIPPING : 0;
  const discount = discounts.reduce((s, d) => s + d.amount, 0);
  return { lines, subtotal, discounts, shipping, needsDelivery, total: Math.max(0, subtotal - discount + shipping) };
}

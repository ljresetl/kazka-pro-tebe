import { describe, expect, it } from "vitest";
import { priceCart, type CartLine } from "@/lib/cart";
import { EBOOK, HARDCOVER, SHIPPING } from "@/lib/offer";

const line = (p: Partial<CartLine>): CartLine => ({ key: Math.random().toString(), storyId: "s1", storyTitle: "Казка", kind: "ebook", qty: 1, ...p });

describe("кошик", () => {
  it("е-книга без доставки", () => {
    const t = priceCart([line({})]);
    expect(t.total).toBe(EBOOK);
    expect(t.needsDelivery).toBe(false);
  });
  it("е-книга входить у друковану тієї ж історії", () => {
    const t = priceCart([line({}), line({ kind: "hardcover" })]);
    expect(t.subtotal).toBe(HARDCOVER);
    expect(t.total).toBe(HARDCOVER + SHIPPING);
  });
  it("оплачена е-книга зараховується", () => {
    const t = priceCart([line({ kind: "hardcover", ebookPaid: true })]);
    expect(t.subtotal).toBe(HARDCOVER - EBOOK);
  });
  it("від 2 книжок доставка безкоштовна, 3-тя зі знижкою 50%", () => {
    const t = priceCart([line({ kind: "hardcover", qty: 3 })]);
    expect(t.shipping).toBe(0);
    expect(t.total).toBe(HARDCOVER * 3 - Math.round(HARDCOVER / 2));
  });
  it("додатки зі знижкою 20%", () => {
    const t = priceCart([line({ kind: "extra", extraId: "rozmalovka" })]);
    expect(t.lines[0].unit).toBe(Math.round(249 * 0.8));
  });
  it("код друга дає −20% на е-книгу, а неправильний код — нічого", () => {
    expect(priceCart([line({})], "ABC234").total).toBe(EBOOK - Math.round(EBOOK * 0.2));
    expect(priceCart([line({})], "bad").total).toBe(EBOOK);
  });
});

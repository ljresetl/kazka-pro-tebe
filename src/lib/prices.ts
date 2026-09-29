import type { ProductId } from "./types";

export type Price = {
  id: ProductId;
  name: string;
  short: string;
  amount: number;
  main?: boolean;
  /** Потрібна доставка Новою Поштою. */
  shipping?: boolean;
  features: string[];
};

export const PRICES: Price[] = [
  {
    id: "pdf",
    name: "Е-книга",
    short: "Е-книга",
    amount: 199,
    main: true,
    features: ["14 сторінок з ілюстраціями", "Читайте онлайн і зберігайте в PDF", "Тексти можна змінити"],
  },
  {
    id: "pdf-coloring",
    name: "Е-книга + розмальовка (старий тариф)",
    short: "PDF і розмальовка",
    amount: 249,
    features: ["Усе з PDF для друку", "Та сама казка контурами для розфарбовування", "Заняття на кілька вечорів"],
  },
  {
    id: "print",
    name: "Книжка у твердій обкладинці",
    short: "Тверда обкладинка",
    amount: 799,
    shipping: true,
    features: ["Формат A4, тверда обкладинка, крейдований папір", "Е-книга входить у ціну", "Доставка Новою Поштою"],
  },
];

export function getPrice(id: string): Price {
  return PRICES.find((p) => p.id === id) ?? PRICES[0];
}

export function formatUah(amount: number) {
  return `${amount.toLocaleString("uk-UA")} грн`;
}

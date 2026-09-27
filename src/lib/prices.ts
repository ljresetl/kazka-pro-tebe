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
    name: "PDF для друку вдома",
    short: "PDF",
    amount: 199,
    main: true,
    features: ["Уся казка з ілюстраціями", "Без водяного знака", "Друкуйте скільки завгодно разів"],
  },
  {
    id: "pdf-coloring",
    name: "PDF + розмальовка",
    short: "PDF і розмальовка",
    amount: 249,
    features: ["Усе з PDF для друку", "Та сама казка контурами для розфарбовування", "Заняття на кілька вечорів"],
  },
  {
    id: "print",
    name: "Книжка в палітурці",
    short: "Друкована книжка",
    amount: 799,
    shipping: true,
    features: ["М'яка обкладинка, кольоровий друк", "Доставка Новою Поштою 1–2 дні", "PDF у подарунок одразу"],
  },
];

export function getPrice(id: string): Price {
  return PRICES.find((p) => p.id === id) ?? PRICES[0];
}

export function formatUah(amount: number) {
  return `${amount.toLocaleString("uk-UA")} грн`;
}

export type PriceId = "pdf" | "pdf-coloring" | "print";

export const PRICES: {
  id: PriceId;
  name: string;
  amount: number;
  main?: boolean;
  features: string[];
}[] = [
  {
    id: "pdf",
    name: "PDF для друку вдома",
    amount: 199,
    main: true,
    features: ["Уся казка, 8 ілюстрованих сторінок", "Без водяного знака", "Друкуйте скільки завгодно разів"],
  },
  {
    id: "pdf-coloring",
    name: "PDF + розмальовка",
    amount: 249,
    features: ["Усе з PDF для друку", "Та сама казка контурами для розфарбовування", "Гарне заняття на вечір"],
  },
  {
    id: "print",
    name: "Книжка в палітурці",
    amount: 799,
    features: ["М'яка обкладинка, кольоровий друк", "Доставка Новою Поштою", "PDF у подарунок"],
  },
];

export function getPrice(id: string) {
  return PRICES.find((p) => p.id === id) ?? PRICES[0];
}

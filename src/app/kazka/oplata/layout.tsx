import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Оформлення замовлення",
  description: "Оформлення замовлення іменної казки: PDF для друку або книжка в палітурці.",
  path: "/kazka/oplata",
  noindex: true,
});

export default function CheckoutLayout({ children }: LayoutProps<"/kazka/oplata">) {
  return children;
}

import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Кошик",
  description: "Кошик і оформлення замовлення персональної дитячої книжки.",
  path: "/koshyk",
  noindex: true,
});

export default function CartLayout({ children }: LayoutProps<"/koshyk">) {
  return children;
}

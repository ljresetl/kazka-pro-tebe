import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Мої казки",
  description: "Усі казки, які ви створили на цьому пристрої, і ваші замовлення.",
  path: "/moi-kazky",
  noindex: true,
});

export default function MyLayout({ children }: LayoutProps<"/moi-kazky">) {
  return children;
}

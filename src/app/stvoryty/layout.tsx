import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Створити іменну казку безкоштовно",
  description:
    "Вкажіть ім'я, вік і улюблену пригоду дитини — і за хвилину прочитаєте персональну казку українською. Перегляд безкоштовний.",
  path: "/stvoryty",
});

export default function CreateLayout({ children }: LayoutProps<"/stvoryty">) {
  return children;
}

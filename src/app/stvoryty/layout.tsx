import type { Metadata } from "next";

export const metadata: Metadata = { title: "Створити казку" };

export default function CreateLayout({ children }: LayoutProps<"/stvoryty">) {
  return children;
}

import type { Metadata } from "next";

export const metadata: Metadata = { title: "Ваша казка", robots: { index: false } };

export default function StoryLayout({ children }: LayoutProps<"/kazka">) {
  return children;
}

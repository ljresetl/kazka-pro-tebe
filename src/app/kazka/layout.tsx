import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";

// Казки особисті й живуть у браузері покупця — у пошук їм не треба.
export const metadata: Metadata = pageMeta({
  title: "Ваша казка",
  description: "Персональна казка, створена для вашої дитини.",
  path: "/kazka",
  noindex: true,
});

export default function StoryLayout({ children }: LayoutProps<"/kazka">) {
  return children;
}

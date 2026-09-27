"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

/**
 * Кнопка «Назад»: повертає на попередню сторінку сайту, а якщо людина
 * прийшла ззовні (з Google чи за посиланням) — веде на `fallback`.
 */
export default function BackLink({ fallback, label = "Назад" }: { fallback: string; label?: string }) {
  const router = useRouter();
  return (
    <Link
      href={fallback}
      className="btn btn-ghost btn-small back-link"
      onClick={(e) => {
        const cameFromSite = typeof document !== "undefined" && document.referrer.startsWith(window.location.origin);
        if (cameFromSite && window.history.length > 1) {
          e.preventDefault();
          router.back();
        }
      }}
    >
      <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M15 5l-7 7 7 7" stroke="currentColor" strokeWidth="2.2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {label}
    </Link>
  );
}

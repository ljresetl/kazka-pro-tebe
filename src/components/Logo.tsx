import Link from "next/link";
import { SITE } from "@/lib/site";
import { Kvitka } from "./Ornament";

export default function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`logo ${className}`} aria-label={`${SITE.name} — на головну`}>
      <Kvitka size={34} className="logo-mark" />
      <span>{SITE.name}</span>
    </Link>
  );
}

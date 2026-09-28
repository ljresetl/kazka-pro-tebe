import Link from "next/link";
import { Sparkles } from "lucide-react";
import SlotImage from "@/components/SlotImage";
import { EBOOK_PRICE } from "@/lib/book-facts";
import { QuickFacts } from "./Blocks";

/** Картка «Почніть зараз за …» з обкладинкою, кнопкою й фактами (як на сторінках імен та ідей). */
export default function StartBox({ image, title, cta, href }: { image: string; title: string; cta: string; href: string }) {
  return (
    <div className="start-box">
      <SlotImage id={image} alt={title} detail="label" sizes="(min-width: 900px) 360px, 92vw" />
      <div className="start-box-body">
        <h2>{title}</h2>
        <p className="start-price">
          <Sparkles size={18} aria-hidden="true" /> Почніть зараз за <strong>{EBOOK_PRICE}</strong>
        </p>
        <div className="home-hero-actions">
          <Link href={href} className="btn btn-primary">
            {cta}
          </Link>
          <Link href="/pryklady" className="btn btn-ghost">
            Приклади
          </Link>
        </div>
        <QuickFacts />
      </div>
    </div>
  );
}

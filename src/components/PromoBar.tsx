import Link from "next/link";
import { Sparkles, Truck } from "lucide-react";
import { FREE_SHIPPING_FROM, THIRD_BOOK_DISCOUNT } from "@/lib/offer";

/** Вузька помаранчева смуга над шапкою з акціями (як на зразку). */
export default function PromoBar() {
  return (
    <div className="promo-bar">
      <Link href="/tsiny" className="wrap promo-row">
        <span>
          <Truck size={16} aria-hidden="true" /> Безкоштовна доставка від {FREE_SHIPPING_FROM} книжок!
        </span>
        <span className="promo-dot promo-mid" aria-hidden="true" />
        <span className="promo-mid">
          <Sparkles size={16} aria-hidden="true" /> −{THIRD_BOOK_DISCOUNT}% на 3-тю книжку у твердій обкладинці
        </span>
      </Link>
    </div>
  );
}

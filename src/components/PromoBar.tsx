import Link from "next/link";
import { formatUah, PRICES } from "@/lib/prices";

/** Вузька помаранчева смуга над шапкою з головними умовами. */
export default function PromoBar() {
  return (
    <div className="promo-bar">
      <div className="wrap promo-row">
        <span>Перегляд казки — безкоштовно</span>
        <span className="promo-dot promo-mid" aria-hidden="true" />
        <span className="promo-mid">PDF одразу після оплати, від {formatUah(PRICES[0].amount)}</span>
        <span className="promo-dot promo-wide" aria-hidden="true" />
        <Link href="/dostavka-i-oplata" className="promo-wide">
          Книжка в палітурці з доставкою Новою Поштою
        </Link>
      </div>
    </div>
  );
}

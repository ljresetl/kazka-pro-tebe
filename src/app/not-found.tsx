import Link from "next/link";
import { Kvitka } from "@/components/Ornament";

export default function NotFound() {
  return (
    <div className="wrap">
      <div className="success" style={{ padding: "64px 0" }}>
        <Kvitka size={72} />
        <h1>Такої сторінки немає</h1>
        <p>Можливо, посилання застаріло або в ньому помилка. Та казки нікуди не ділися.</p>
        <div className="button-row" style={{ justifyContent: "center" }}>
          <Link href="/" className="btn btn-primary">
            На головну
          </Link>
          <Link href="/pryklady" className="btn btn-ghost">
            Приклади казок
          </Link>
        </div>
      </div>
    </div>
  );
}

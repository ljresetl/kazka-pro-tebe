import Link from "next/link";
import { Lock } from "lucide-react";
import { SITE } from "@/lib/site";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Іменні казки українською для дітей від малюків до 10+ років. Перегляд безкоштовний, платите лише за ту казку, яку хочете зберегти.</p>
        </div>
        <div>
          <h2>Відкрийте</h2>
          <ul>
            <li>
              <Link href="/stvoryty">Створити книжку</Link>
            </li>
            <li>
              <Link href="/pryklady">Приклади</Link>
            </li>
            <li>
              <Link href="/vidhuky">Відгуки</Link>
            </li>
            <li>
              <Link href="/tsiny">Ціни</Link>
            </li>
            <li>
              <Link href="/mozhlyvosti">Можливості</Link>
            </li>
            <li>
              <Link href="/moi-kazky">Мої казки</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Привід</h2>
          <ul>
            <li>
              <Link href="/podarunky/den-narodzhennia">День народження</Link>
            </li>
            <li>
              <Link href="/podarunky/narodzhennia-dytyny">Народження малюка</Link>
            </li>
            <li>
              <Link href="/podarunky/rizdvo">Різдво</Link>
            </li>
            <li>
              <Link href="/podarunky/mykolai">Святий Миколай</Link>
            </li>
            <li>
              <Link href="/podarunky">Усі приводи</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Натхнення</h2>
          <ul>
            <li>
              <Link href="/idei">Ідеї для книжок</Link>
            </li>
            <li>
              <Link href="/temy">Теми</Link>
            </li>
            <li>
              <Link href="/imena">Популярні імена</Link>
            </li>
            <li>
              <Link href="/vik">За віком</Link>
            </li>
            <li>
              <Link href="/biblioteka">Безкоштовні казки</Link>
            </li>
            <li>
              <Link href="/blog">Блог</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Підтримка</h2>
          <ul>
            <li>
              <Link href="/dopomoha">Центр допомоги</Link>
            </li>
            <li>
              <Link href="/dostavka-i-oplata">Доставка й оплата</Link>
            </li>
            <li>
              <Link href="/umovy">Публічна оферта</Link>
            </li>
            <li>
              <Link href="/konfidentsiinist">Конфіденційність</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Зв&apos;язок</h2>
          <ul>
            <li>
              <Link href="/kontakty">Контакти</Link>
            </li>
            {SITE.email && (
              <li>
                <a href={`mailto:${SITE.email}`}>{SITE.email}</a>
              </li>
            )}
            {SITE.phone && (
              <li>
                <a href={`tel:${SITE.phone}`}>{SITE.phone}</a>
              </li>
            )}
            {SITE.telegram && (
              <li>
                <a href={SITE.telegram} rel="noopener">
                  Telegram
                </a>
              </li>
            )}
            {SITE.instagram && (
              <li>
                <a href={SITE.instagram} rel="noopener">
                  Instagram
                </a>
              </li>
            )}
          </ul>
        </div>
      </div>
      <div className="wrap footer-pay" aria-label="Способи оплати">
        <span className="footer-pay-title">
          <Lock size={14} aria-hidden="true" /> Безпечна оплата
        </span>
        {["Visa", "Mastercard", "Apple Pay", "Google Pay", "LiqPay"].map((m) => (
          <span key={m} className="pay-badge">
            {m}
          </span>
        ))}
      </div>
      <div className="wrap footer-bottom">
        <span>
          © {new Date().getFullYear()} {SITE.sellerName || SITE.name}. Народні казки в бібліотеці — наш власний
          переказ.
        </span>
        <span>
          Сайт створено командою{" "}
          <a href="https://webdevcompass.com" target="_blank" rel="noopener">
            webdevcompass.com
          </a>
        </span>
      </div>
    </footer>
  );
}

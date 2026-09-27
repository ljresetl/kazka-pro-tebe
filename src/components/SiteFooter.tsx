import Link from "next/link";
import { SITE } from "@/lib/site";
import Logo from "./Logo";

export default function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="wrap footer-grid">
        <div className="footer-brand">
          <Logo />
          <p>Іменні казки українською для дітей 2–8 років. Перегляд безкоштовний, платите лише за ту казку, яку хочете зберегти.</p>
        </div>
        <div>
          <h2>Казки</h2>
          <ul>
            <li>
              <Link href="/stvoryty">Створити казку</Link>
            </li>
            <li>
              <Link href="/pryklady">Приклади</Link>
            </li>
            <li>
              <Link href="/biblioteka">Безкоштовні казки</Link>
            </li>
            <li>
              <Link href="/blog">Блог про казки</Link>
            </li>
            <li>
              <Link href="/moi-kazky">Мої казки</Link>
            </li>
          </ul>
        </div>
        <div>
          <h2>Покупцям</h2>
          <ul>
            <li>
              <Link href="/#tsiny">Ціни</Link>
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
      <div className="wrap footer-bottom">
        © {new Date().getFullYear()} {SITE.sellerName || SITE.name}. Народні казки в бібліотеці — наш власний
        переказ.
      </div>
    </footer>
  );
}

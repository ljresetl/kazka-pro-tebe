"use client";

import Link from "next/link";
import { BookHeart, ShoppingBag } from "lucide-react";
import { priceCart, REFERRAL_RE } from "@/lib/cart";
import { saveReferral, useCart } from "@/lib/storage";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/pryklady", label: "Приклади" },
  { href: "/vidhuky", label: "Відгуки" },
  { href: "/podarunky", label: "Привід" },
  { href: "/mozhlyvosti", label: "Можливості" },
  { href: "/tsiny", label: "Ціни" },
];

export default function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(pathname);

  // Закриваємо меню після переходу на іншу сторінку.
  if (open && openedAt !== pathname) setOpen(false);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const cart = useCart();
  const count = cart ? priceCart(cart).lines.reduce((n, l) => n + l.qty, 0) : 0;

  // Посилання друга ?kod=XXXXXX — запам'ятовуємо код для знижки в кошику.
  useEffect(() => {
    const code = new URLSearchParams(window.location.search).get("kod")?.toUpperCase();
    if (code && REFERRAL_RE.test(code)) saveReferral(code);
  }, []);

  const isActive = (href: string) => !href.includes("#") && pathname.startsWith(href);

  return (
    <header className="site-header">
      <a href="#main" className="skip-link">
        Перейти до змісту
      </a>
      <div className="wrap header-row">
        <Logo />

        <nav className="nav-desktop" aria-label="Головне меню">
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} aria-current={isActive(item.href) ? "page" : undefined}>
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="header-actions">
          <Link href="/moi-kazky" className="header-icon" aria-label="Мої казки" title="Мої казки">
            <BookHeart size={22} aria-hidden="true" />
          </Link>
          <Link href="/koshyk" className="header-icon header-cart" aria-label={`Кошик${count ? `: ${count}` : ""}`} title="Кошик">
            <ShoppingBag size={22} aria-hidden="true" />
            {count > 0 && <span className="header-cart-count">{count}</span>}
          </Link>
          <Link href="/stvoryty" className="btn btn-primary btn-small header-cta">
            Створити дитячу книжку
          </Link>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Закрити меню" : "Відкрити меню"}
            onClick={() => {
              setOpen((o) => !o);
              setOpenedAt(pathname);
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden="true">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <nav id="mobile-menu" className="mobile-menu" aria-label="Меню">
          <Link href="/">Головна</Link>
          {NAV.map((item) => (
            <Link key={item.href} href={item.href} onClick={() => setOpen(false)}>
              {item.label}
            </Link>
          ))}
          <Link href="/idei">Ідеї для книжок</Link>
          <Link href="/temy">Теми</Link>
          <Link href="/imena">Імена</Link>
          <Link href="/vik">За віком</Link>
          <Link href="/biblioteka">Безкоштовні казки</Link>
          <Link href="/blog">Блог</Link>
          <Link href="/moi-kazky">Мої казки</Link>
          <Link href="/dopomoha">Допомога</Link>
          <Link href="/stvoryty" className="btn btn-primary btn-block">
            Створити дитячу книжку
          </Link>
        </nav>
      )}
    </header>
  );
}

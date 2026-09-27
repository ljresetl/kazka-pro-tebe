"use client";

import Link from "next/link";
import Logo from "./Logo";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const NAV = [
  { href: "/pryklady", label: "Приклади" },
  { href: "/biblioteka", label: "Безкоштовні казки" },
  { href: "/blog", label: "Блог" },
  { href: "/#tsiny", label: "Ціни" },
  { href: "/moi-kazky", label: "Мої казки" },
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
          <Link href="/stvoryty" className="btn btn-primary btn-small header-cta">
            Створити казку
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
          <Link href="/dostavka-i-oplata">Доставка й оплата</Link>
          <Link href="/kontakty">Контакти</Link>
          <Link href="/stvoryty" className="btn btn-primary btn-block">
            Створити казку
          </Link>
        </nav>
      )}
    </header>
  );
}

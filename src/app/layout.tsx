import type { Metadata } from "next";
import { Literata, Unbounded } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["500", "700", "900"],
});

const literata = Literata({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "Казка про тебе — іменні казки для дітей",
    template: "%s · Казка про тебе",
  },
  description:
    "Персональна казка українською, де головний герой — ваша дитина. Безкоштовний перегляд за 2 хвилини, PDF для друку вдома або друкована книжка.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={`${unbounded.variable} ${literata.variable}`}>
      <body>
        <header className="site-header">
          <Link href="/" className="logo" aria-label="Казка про тебе — на головну">
            <span className="logo-mark" aria-hidden="true">К</span>
            Казка про тебе
          </Link>
          <nav className="site-nav" aria-label="Головне меню">
            <Link href="/pryklady">Приклади</Link>
            <Link href="/biblioteka">Бібліотека</Link>
            <Link href="/#yak-tse-pratsyuye">Як це працює</Link>
            <Link href="/#tsiny">Ціни</Link>
            <Link href="/stvoryty" className="btn btn-primary btn-small">
              Створити<span className="hide-sm"> казку</span>
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer className="site-footer">
          <p>
            <strong>Казка про тебе</strong> — іменні казки українською для дітей 2–8 років.
          </p>
          <p className="muted">
            Народні казки в бібліотеці — наш власний переказ. © {new Date().getFullYear()}
          </p>
        </footer>
      </body>
    </html>
  );
}

import type { ReactNode } from "react";
import { OrnamentRule } from "./Ornament";

/**
 * Змістовний текст унизу сторінки для людей і пошуковиків.
 * На кожній сторінці — власний, неповторний текст.
 */
export default function SeoText({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="seo-text" aria-labelledby="seo-title">
      <div className="wrap">
        <OrnamentRule className="ornament-rule" />
        <h2 id="seo-title">{title}</h2>
        <div className="seo-cols">{children}</div>
      </div>
    </section>
  );
}

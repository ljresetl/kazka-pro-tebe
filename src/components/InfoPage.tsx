import type { ReactNode } from "react";
import BackLink from "./BackLink";
import { OrnamentRule } from "./Ornament";

/** Обгортка для текстових сторінок: «Назад», орнамент, заголовок і текст. */
export default function InfoPage({ title, updated, children }: { title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="wrap">
      <div className="back-row">
        <BackLink fallback="/" />
      </div>
      <article className="prose">
        <OrnamentRule className="ornament-rule" />
        <h1>{title}</h1>
        {updated && <p className="muted">Редакція від {updated}</p>}
        {children}
      </article>
    </div>
  );
}

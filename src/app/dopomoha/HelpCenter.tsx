"use client";

import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import type { HelpSection } from "@/lib/help";

/** Пошук і розділи центру допомоги. */
export default function HelpCenter({ sections }: { sections: HelpSection[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const found = useMemo(
    () =>
      q.length < 2
        ? []
        : sections.flatMap((s) => s.items.filter((i) => (i.q + " " + i.a).toLowerCase().includes(q)).map((i) => ({ ...i, section: s.title }))),
    [q, sections],
  );

  return (
    <>
      <div className="help-search">
        <h2>Шукайте відповідь одразу</h2>
        <label className="help-search-box">
          <Search size={20} aria-hidden="true" />
          <input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Наприклад: доставка, фото, розмальовка" aria-label="Пошук у допомозі" />
        </label>
        {q.length >= 2 && (
          <div className="faq help-results" aria-live="polite">
            {found.length === 0 ? (
              <p className="muted">Нічого не знайшлося. Спробуйте інше слово або напишіть нам.</p>
            ) : (
              found.map((f) => (
                <details key={f.q}>
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))
            )}
          </div>
        )}
      </div>

      <h2 className="help-cats-title">Чим можемо допомогти?</h2>
      <nav className="help-cats" aria-label="Розділи допомоги">
        {sections.map((s) => (
          <a key={s.id} href={`#${s.id}`}>
            <span aria-hidden="true">{s.icon}</span> {s.title}
          </a>
        ))}
      </nav>

      {sections.map((s) => (
        <section key={s.id} id={s.id} className="help-section">
          <h2>
            <span aria-hidden="true">{s.icon}</span> {s.title}
          </h2>
          <div className="faq">
            {s.items.map((i) => (
              <details key={i.q}>
                <summary>
                  <h3>{i.q}</h3>
                </summary>
                <p>{i.a}</p>
              </details>
            ))}
          </div>
          <a href="#top" className="help-back">
            ↑ До розділів
          </a>
        </section>
      ))}
    </>
  );
}

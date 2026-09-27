"use client";

import { Search } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import Scene from "@/components/Scene";
import { CATEGORIES, getCategory, LIBRARY } from "@/lib/library";

const AGES = [
  { id: "2", label: "від 2 років", max: 2 },
  { id: "4", label: "від 4 років", max: 4 },
  { id: "6", label: "від 6 років", max: 6 },
];

/** Каталог бібліотеки: пошук за назвою, розділи й вік. Росте разом із кількістю казок. */
export default function LibraryList() {
  const sp = useSearchParams();
  const rozdil = sp.get("rozdil") ?? "";
  const vik = sp.get("vik") ?? "";
  const [query, setQuery] = useState("");

  const href = (patch: Record<string, string>) => {
    const next = new URLSearchParams({ rozdil, vik, ...patch });
    for (const [k, v] of [...next.entries()]) if (!v) next.delete(k);
    const q = next.toString();
    return q ? `/biblioteka?${q}` : "/biblioteka";
  };

  const age = AGES.find((a) => a.id === vik);
  const q = query.trim().toLowerCase();
  const list = LIBRARY.filter(
    (b) =>
      (!rozdil || b.category === rozdil) &&
      (!age || b.minAge <= age.max) &&
      (!q || b.title.toLowerCase().includes(q) || b.summary.toLowerCase().includes(q)),
  );

  return (
    <>
      <div className="search-field">
        <Search size={20} aria-hidden="true" />
        <label htmlFor="lib-search" className="sr-only">
          Пошук казки
        </label>
        <input
          id="lib-search"
          type="search"
          className="field-input"
          placeholder="Знайти казку: Рукавичка, Колобок…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <div className="filter-group">
        <p className="filter-label">Розділ</p>
        <nav className="filter-bar" aria-label="Розділи бібліотеки">
          <Link href={href({ rozdil: "" })} className={`filter ${rozdil ? "" : "is-active"}`} scroll={false}>
            Усі
          </Link>
          {CATEGORIES.map((c) => {
            const count = LIBRARY.filter((b) => b.category === c.id).length;
            if (!count) return null;
            return (
              <Link
                key={c.id}
                href={href({ rozdil: c.id })}
                className={`filter ${rozdil === c.id ? "is-active" : ""}`}
                scroll={false}
              >
                {c.label} ({count})
              </Link>
            );
          })}
        </nav>
      </div>
      <div className="filter-group">
        <p className="filter-label">Вік</p>
        <nav className="filter-bar" aria-label="Вік">
          <Link href={href({ vik: "" })} className={`filter ${vik ? "" : "is-active"}`} scroll={false}>
            Будь-який
          </Link>
          {AGES.map((a) => (
            <Link key={a.id} href={href({ vik: a.id })} className={`filter ${vik === a.id ? "is-active" : ""}`} scroll={false}>
              {a.label}
            </Link>
          ))}
        </nav>
      </div>

      <p className="muted" style={{ margin: "8px 0 16px", fontSize: 15 }} aria-live="polite">
        Казок: {list.length}
      </p>

      {list.length === 0 ? (
        <div className="empty">
          <h2>Нічого не знайшли</h2>
          <p>Бібліотека постійно поповнюється. Спробуйте іншу назву або скиньте фільтри.</p>
          <Link href="/biblioteka" className="btn btn-ghost" onClick={() => setQuery("")}>
            Показати всі казки
          </Link>
        </div>
      ) : (
        <div className="card-grid">
          {list.map((b) => (
            <Link key={b.slug} href={`/biblioteka/${b.slug}`} className="card">
              <Scene id={b.cover} />
              <div className="card-body">
                <h3>{b.title}</h3>
                <p>{b.summary}</p>
                <div className="tags">
                  <span className="tag">{b.ages}</span>
                  <span className="tag is-mint">{getCategory(b.category).label}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

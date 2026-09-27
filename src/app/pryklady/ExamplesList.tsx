"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import ExampleCard from "@/components/ExampleCard";
import { AGE_GROUPS, EXAMPLES } from "@/lib/examples";
import { THEMES, TRAITS } from "@/lib/themes";

// Фільтри читають адресу (?vik=…&tema=…&rysa=…) у браузері,
// тож каталог працює і на статичному хостингу.
export default function ExamplesList() {
  const sp = useSearchParams();
  const vik = sp.get("vik") ?? "";
  const tema = sp.get("tema") ?? "";
  const rysa = sp.get("rysa") ?? "";

  const href = (patch: Record<string, string>) => {
    const next = new URLSearchParams({ vik, tema, rysa, ...patch });
    for (const [k, v] of [...next.entries()]) if (!v) next.delete(k);
    const q = next.toString();
    return q ? `/pryklady?${q}` : "/pryklady";
  };

  const age = AGE_GROUPS.find((g) => g.id === vik);
  const list = EXAMPLES.filter(
    (e) => (!age || age.test(e.age)) && (!tema || e.theme === tema) && (!rysa || e.trait === rysa),
  );

  return (
    <>
      <div className="filter-group">
        <p className="filter-label">Вік</p>
        <nav className="filter-bar" aria-label="Фільтр за віком">
          <Link href={href({ vik: "" })} className={`filter ${vik ? "" : "is-active"}`} scroll={false}>
            Будь-який
          </Link>
          {AGE_GROUPS.map((g) => (
            <Link
              key={g.id}
              href={href({ vik: g.id })}
              className={`filter ${vik === g.id ? "is-active" : ""}`}
              aria-current={vik === g.id ? "true" : undefined}
              scroll={false}
            >
              {g.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="filter-group">
        <p className="filter-label">Пригода</p>
        <nav className="filter-bar" aria-label="Фільтр за пригодою">
          <Link href={href({ tema: "" })} className={`filter ${tema ? "" : "is-active"}`} scroll={false}>
            Усі
          </Link>
          {THEMES.map((t) => (
            <Link
              key={t.id}
              href={href({ tema: t.id })}
              className={`filter ${tema === t.id ? "is-active" : ""}`}
              aria-current={tema === t.id ? "true" : undefined}
              scroll={false}
            >
              {t.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="filter-group">
        <p className="filter-label">Про що казка</p>
        <nav className="filter-bar" aria-label="Фільтр за рисою характеру">
          <Link href={href({ rysa: "" })} className={`filter ${rysa ? "" : "is-active"}`} scroll={false}>
            Про все
          </Link>
          {TRAITS.map((t) => (
            <Link
              key={t}
              href={href({ rysa: t })}
              className={`filter ${rysa === t ? "is-active" : ""}`}
              aria-current={rysa === t ? "true" : undefined}
              scroll={false}
            >
              {t}
            </Link>
          ))}
        </nav>
      </div>

      <p className="muted" style={{ margin: "8px 0 16px", fontSize: 15 }} aria-live="polite">
        Знайдено: {list.length}
      </p>

      {list.length === 0 ? (
        <div className="empty">
          <h2>Такої казки серед прикладів немає</h2>
          <p>Але ви можете створити її самі — з будь-якою пригодою й рисою характеру.</p>
          <div className="button-row" style={{ justifyContent: "center" }}>
            <Link href="/pryklady" className="btn btn-ghost">
              Скинути фільтри
            </Link>
            <Link href="/stvoryty" className="btn btn-primary">
              Створити казку
            </Link>
          </div>
        </div>
      ) : (
        <div className="card-grid">
          {list.map((e) => (
            <ExampleCard key={e.slug} e={e} />
          ))}
        </div>
      )}
    </>
  );
}

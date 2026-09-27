"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Scene from "@/components/Scene";
import { EXAMPLES } from "@/lib/examples";
import { yearsWord } from "@/lib/template-story";
import { getTheme, THEMES } from "@/lib/themes";

// Фільтр читає ?tema= у браузері, щоб каталог працював і на статичному хостингу.
export default function ExamplesList() {
  const tema = useSearchParams().get("tema");
  const active = tema ?? "";
  const list = active ? EXAMPLES.filter((e) => e.theme === active) : EXAMPLES;

  return (
    <>
      <nav className="choices filter-bar" aria-label="Фільтр за пригодою">
        <Link
          href="/pryklady"
          className={`filter ${active ? "" : "is-active"}`}
          aria-current={active ? undefined : "page"}
        >
          Усі ({EXAMPLES.length})
        </Link>
        {THEMES.map((t) => {
          const count = EXAMPLES.filter((e) => e.theme === t.id).length;
          if (!count) return null;
          const on = active === t.id;
          return (
            <Link
              key={t.id}
              href={`/pryklady?tema=${t.id}`}
              className={`filter ${on ? "is-active" : ""}`}
              aria-current={on ? "page" : undefined}
            >
              {t.label} ({count})
            </Link>
          );
        })}
      </nav>

      <div className="library-grid">
        {list.map((e) => (
          <Link key={e.slug} href={`/pryklady/${e.slug}`} className="theme-card">
            {e.coverImage ? (
              <Image
                src={e.coverImage.src}
                width={e.coverImage.width}
                height={e.coverImage.height}
                alt=""
                className="card-img"
              />
            ) : (
              <Scene id={e.cover} />
            )}
            <div className="theme-card-body">
              <h3>{e.title}</h3>
              <p>
                {e.childName}, {yearsWord(e.age)} · {getTheme(e.theme).label}
              </p>
              <p className="muted" style={{ fontSize: 14 }}>
                Допомагає: {e.trait}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </>
  );
}

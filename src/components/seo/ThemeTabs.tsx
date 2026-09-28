"use client";

import Link from "next/link";
import { useState } from "react";
import { CATEGORIES } from "@/lib/catalog";

/** «Оберіть тему»: вкладки розділів, під ними — теми обраного розділу. */
export default function ThemeTabs({ age }: { age?: string }) {
  const [active, setActive] = useState(CATEGORIES[0].id);
  const cat = CATEGORIES.find((c) => c.id === active)!;
  return (
    <div className="theme-tabs">
      <div className="theme-tabs-list" role="tablist" aria-label="Розділи тем">
        {CATEGORIES.map((c) => (
          <button
            key={c.id}
            type="button"
            role="tab"
            aria-selected={c.id === active}
            className={c.id === active ? "is-active" : ""}
            onClick={() => setActive(c.id)}
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="topic-chips" role="tabpanel">
        {cat.topics.map((t) => (
          <Link key={t.id} href={age ? `/stvoryty?vik=${age}&tema=${t.id}` : `/temy/${t.id}`} className="topic-chip is-plain">
            {t.label}
          </Link>
        ))}
      </div>
    </div>
  );
}

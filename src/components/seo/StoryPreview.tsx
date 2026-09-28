"use client";

import Link from "next/link";
import { useState } from "react";

/** Приклад історії: спершу видно початок, кнопка розгортає решту. */
export default function StoryPreview({ text, more, href }: { text: string; more: string; href: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`story-preview ${open ? "is-open" : ""}`}>
      <h3>Приклад історії</h3>
      <div className="story-preview-text">
        <p>{text}</p>
        {open && <p>{more}</p>}
      </div>
      {open ? (
        <Link href={href} className="btn btn-primary btn-small">
          Створити цю історію
        </Link>
      ) : (
        <button type="button" className="link-btn" onClick={() => setOpen(true)}>
          Прочитати всю історію ↓
        </button>
      )}
    </div>
  );
}

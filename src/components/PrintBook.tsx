"use client";

import Scene from "./Scene";
import type { SceneId } from "@/lib/types";

type Props = {
  title: string;
  dedication: string;
  cover: SceneId;
  pages: { text: string; scene: SceneId }[];
  /** Текст водяного знака для неоплаченого перегляду. */
  watermark?: string;
};

// Версія книжки лише для друку: одна сторінка казки на аркуш.
export default function PrintBook({ title, dedication, cover, pages, watermark }: Props) {
  return (
    <div className="print-book" aria-hidden="true">
      <section className="print-page print-cover">
        <Scene id={cover} />
        <h1 className="cover-title">{title}</h1>
        <p className="cover-dedication">{dedication}</p>
        {watermark && <span className="watermark">{watermark}</span>}
      </section>
      {pages.map((p, i) => (
        <section className="print-page" key={i}>
          <Scene id={p.scene} />
          <p className="story-text">{p.text}</p>
          <span className="page-no">{i + 1}</span>
          {watermark && <span className="watermark">{watermark}</span>}
        </section>
      ))}
    </div>
  );
}

export function PrintButtons({ note }: { note?: string }) {
  const print = (coloring: boolean) => {
    const root = document.documentElement;
    root.classList.toggle("print-coloring", coloring);
    const cleanup = () => {
      root.classList.remove("print-coloring");
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <div className="print-buttons">
      <button type="button" className="btn btn-primary" onClick={() => print(false)}>
        Роздрукувати або зберегти PDF
      </button>
      <button type="button" className="btn btn-ghost" onClick={() => print(true)}>
        Роздрукувати розмальовку
      </button>
      <p className="hint">
        {note ?? "У вікні друку оберіть «Зберегти як PDF», щоб отримати файл. Формат A4, одна сторінка казки на аркуш."}
      </p>
    </div>
  );
}

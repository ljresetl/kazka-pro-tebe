"use client";

import { Palette, Printer } from "lucide-react";
import type { Illustration, SceneId } from "@/lib/types";
import Scene from "./Scene";

type Props = {
  title: string;
  dedication: string;
  cover: SceneId;
  coverImage?: Illustration;
  pages: { text: string; scene: SceneId; image?: Illustration }[];
  /** Текст водяного знака для неоплаченого перегляду. */
  watermark?: string;
  fontClass?: string;
};

function Art({ scene, image }: { scene: SceneId; image?: Illustration }) {
  // eslint-disable-next-line @next/next/no-img-element -- для друку потрібна звичайна картинка без лінивого завантаження
  return image ? <img src={image.src} alt="" /> : <Scene id={scene} />;
}

// Версія книжки лише для друку: одна сторінка казки на аркуш A4.
export default function PrintBook({ title, dedication, cover, coverImage, pages, watermark, fontClass = "" }: Props) {
  return (
    <div className={`print-book ${fontClass}`} aria-hidden="true">
      <section className="print-page print-cover">
        <Art scene={cover} image={coverImage} />
        <p className="cover-title">{title}</p>
        <p className="cover-dedication">{dedication}</p>
        {watermark && <span className="watermark">{watermark}</span>}
      </section>
      {pages.map((p, i) => (
        <section className="print-page" key={i}>
          <Art scene={p.scene} image={p.image} />
          <p className="story-text">{p.text}</p>
          <span className="page-no">{i + 1}</span>
          {watermark && <span className="watermark">{watermark}</span>}
        </section>
      ))}
    </div>
  );
}

export function PrintButtons({ note, coloring = true }: { note?: string; coloring?: boolean }) {
  const print = (asColoring: boolean) => {
    const root = document.documentElement;
    root.classList.toggle("print-coloring", asColoring);
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
        <Printer size={18} aria-hidden="true" />
        Роздрукувати або зберегти PDF
      </button>
      {coloring && (
        <button type="button" className="btn btn-ghost" onClick={() => print(true)}>
          <Palette size={18} aria-hidden="true" />
          Роздрукувати розмальовку
        </button>
      )}
      <p className="hint">
        {note ?? "У вікні друку оберіть «Зберегти як PDF», щоб отримати файл. Формат A4, одна сторінка казки на аркуш."}
      </p>
    </div>
  );
}

"use client";

import { Palette, Printer } from "lucide-react";
import { useState } from "react";
import { lineArt } from "@/lib/line-art";
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

// Версія книжки лише для друку, як справжня книжка A4:
// обкладинка, титул із передмовою, далі кожна сторінка історії — ілюстрація
// на ~70% аркуша й текст під нею. Для 12 сторінок історії виходить 14 сторінок.
export default function PrintBook({ title, dedication, cover, coverImage, pages, watermark, fontClass = "" }: Props) {
  const mark = watermark ? <span className="watermark">{watermark}</span> : null;
  return (
    <div className={`print-book ${fontClass}`} aria-hidden="true">
      <section className="print-page print-cover">
        <Art scene={cover} image={coverImage} />
        <p className="cover-title">{title}</p>
        {mark}
      </section>
      <section className="print-page print-title-page">
        <p className="cover-title">{title}</p>
        <p className="cover-dedication">{dedication}</p>
        <span className="page-no">2</span>
        {mark}
      </section>
      {pages.map((p, i) => (
        <section key={i} className="print-page print-story-page">
          <Art scene={p.scene} image={p.image} />
          <p className="story-text">{p.text}</p>
          <span className="page-no">{3 + i}</span>
          {mark}
        </section>
      ))}
    </div>
  );
}

/** Скільки сторінок у книжці: обкладинка, титул і по одній на кожну сторінку історії. */
export function printPageCount(storyPages: number) {
  return 2 + storyPages;
}

export function PrintButtons({ note, coloring = true, label = "Роздрукувати або зберегти PDF" }: { note?: string; coloring?: boolean; label?: string }) {
  const [preparing, setPreparing] = useState(false);

  const print = async (asColoring: boolean) => {
    const root = document.documentElement;
    // Для розмальовки ілюстрації тимчасово замінюються контурами, після друку — повертаються.
    const swapped: [HTMLImageElement, string][] = [];
    if (asColoring) {
      setPreparing(true);
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".print-book img"));
      await Promise.all(
        imgs.map(async (img) => {
          try {
            const art = await lineArt(img.currentSrc || img.src);
            swapped.push([img, img.src]);
            img.src = art;
          } catch {
            // Лишаємо картинку як є — CSS зробить її чорно-білою.
          }
        }),
      );
      await Promise.all(swapped.map(([img]) => img.decode().catch(() => {})));
      setPreparing(false);
    }
    root.classList.toggle("print-coloring", asColoring);
    const cleanup = () => {
      root.classList.remove("print-coloring");
      swapped.forEach(([img, src]) => (img.src = src));
      window.removeEventListener("afterprint", cleanup);
    };
    window.addEventListener("afterprint", cleanup);
    window.print();
  };

  return (
    <div className="print-buttons">
      <button type="button" className="btn btn-primary" onClick={() => print(false)}>
        <Printer size={18} aria-hidden="true" />
        {label}
      </button>
      {coloring && (
        <button type="button" className="btn btn-ghost" onClick={() => print(true)} disabled={preparing}>
          <Palette size={18} aria-hidden="true" />
          {preparing ? "Готуємо контури…" : "Роздрукувати розмальовку"}
        </button>
      )}
      <p className="hint">
        {note ?? "У вікні друку оберіть «Зберегти як PDF», щоб отримати файл. Формат A4: обкладинка, титул і сторінки з ілюстрацією й текстом."}
      </p>
    </div>
  );
}

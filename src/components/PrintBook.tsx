"use client";

import { Palette, Printer } from "lucide-react";
import { useState } from "react";
import { aiColoring, canAiColor } from "@/lib/coloring";
import { lineArt } from "@/lib/line-art";
import { bookTextSize } from "@/lib/text-size";
import type { Illustration, SceneId, Story } from "@/lib/types";
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

function Art({ scene, image, idx }: { scene: SceneId; image?: Illustration; idx: number }) {
  // eslint-disable-next-line @next/next/no-img-element -- для друку потрібна звичайна картинка без лінивого завантаження
  return image ? <img src={image.src} alt="" data-idx={idx} /> : <Scene id={scene} />;
}

// Версія книжки лише для друку, як справжня книжка A4:
// обкладинка, титул із передмовою, далі кожна сторінка історії — ілюстрація
// на ~70% аркуша й текст під нею. Для 12 сторінок історії виходить 14 сторінок.
export default function PrintBook({ title, dedication, cover, coverImage, pages, watermark, fontClass = "" }: Props) {
  const mark = watermark ? <span className="watermark">{watermark}</span> : null;
  const sizeClass = bookTextSize(pages.map((p) => p.text));
  return (
    <div className={`print-book ${fontClass}`} aria-hidden="true">
      <section className="print-page print-cover">
        <Art scene={cover} image={coverImage} idx={-1} />
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
          <Art scene={p.scene} image={p.image} idx={i} />
          <p className={`story-text ${sizeClass}`}>{p.text}</p>
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

export function PrintButtons({
  note,
  coloring = true,
  label = "Роздрукувати або зберегти PDF",
  story,
}: {
  note?: string;
  coloring?: boolean;
  label?: string;
  /** Оплачена книжка: розмальовку робить ШІ (чисті контури), інакше — браузер. */
  story?: Story;
}) {
  const [preparing, setPreparing] = useState(false);
  const [progress, setProgress] = useState<[number, number] | null>(null);
  const [error, setError] = useState("");

  const print = async (asColoring: boolean) => {
    const root = document.documentElement;
    // Для розмальовки ілюстрації тимчасово замінюються контурами, після друку — повертаються.
    const swapped: [HTMLImageElement, string][] = [];
    if (asColoring) {
      setPreparing(true);
      setError("");
      let ai = new Map<number, string>();
      if (canAiColor(story)) {
        try {
          ai = await aiColoring(story!, (done, total) => setProgress([done, total]));
        } catch (err) {
          setError(err instanceof Error ? err.message : "Не вдалося зробити розмальовку.");
          setPreparing(false);
          setProgress(null);
          return;
        }
        setProgress(null);
      }
      const imgs = Array.from(document.querySelectorAll<HTMLImageElement>(".print-book img"));
      await Promise.all(
        imgs.map(async (img) => {
          try {
            const fromAi = ai.get(Number(img.dataset.idx));
            const art = fromAi ?? (await lineArt(img.currentSrc || img.src));
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
          {progress ? `Малюємо розмальовку: ${progress[0]} з ${progress[1]}…` : preparing ? "Готуємо контури…" : "Роздрукувати розмальовку"}
        </button>
      )}
      <p className="hint">
        {note ?? "У вікні друку оберіть «Зберегти як PDF», щоб отримати файл. Формат A4: обкладинка, титул і сторінки з ілюстрацією й текстом."}
      </p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

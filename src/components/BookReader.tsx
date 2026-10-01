"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { PageFlip } from "page-flip";
import type { Illustration, SceneId } from "@/lib/types";
import { Kvitka } from "./Ornament";
import BackCover from "./BackCover";
import { printPageCount } from "./PrintBook";
import { bookTextSize } from "@/lib/text-size";
import Scene from "./Scene";

type Props = {
  title: string;
  dedication: string;
  cover: SceneId;
  coverImage?: Illustration;
  pages: { text: string; scene: SceneId; image?: Illustration }[];
  /** Сторінки історії з цим індексом і далі показуються розмитими. */
  lockedFrom?: number;
  lockedMessage?: ReactNode;
  /** CSS-клас шрифту книжки (крок «Шрифт» у конструкторі). */
  fontClass?: string;
};

function Art({ scene, image, eager }: { scene: SceneId; image?: Illustration; eager?: boolean }) {
  return image ? (
    // eslint-disable-next-line @next/next/no-img-element -- сторінки перегортає page-flip, next/image тут лише заважає
    <img src={image.src} alt="" className="flip-img" loading={eager ? "eager" : "lazy"} draggable={false} />
  ) : (
    <Scene id={scene} />
  );
}

/**
 * Читалка як справжня книжка: тверда обкладинка, далі сторінки перегортаються з анімацією.
 * На широкому екрані видно розворот із двох сторінок, на телефоні — одну сторінку.
 * Сторінки створює page-flip (він сам переставляє DOM), а вміст у них малює React через портали.
 */
export default function BookReader({ title, dedication, cover, coverImage, pages, lockedFrom, lockedMessage, fontClass = "" }: Props) {
  // Обкладинка, титул, сторінки історії й задня обкладинка.
  const count = pages.length + 3;
  const sizeClass = bookTextSize(pages.map((p) => p.text));
  const printTotal = printPageCount(pages.length);
  const hostRef = useRef<HTMLDivElement>(null);
  const flipRef = useRef<PageFlip | null>(null);
  const [slots, setSlots] = useState<HTMLElement[]>([]);
  const [current, setCurrent] = useState(0);
  const [portrait, setPortrait] = useState(true);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const book = document.createElement("div");
    host.appendChild(book);
    const els = Array.from({ length: count }, (_, i) => {
      const el = document.createElement("div");
      const hard = i === 0 || i === count - 1;
      el.className = `flip-page${hard ? " is-hard" : ""}`;
      el.dataset.density = hard ? "hard" : "soft";
      book.appendChild(el);
      return el;
    });
    setSlots(els);
    setCurrent(0);

    let pf: PageFlip | null = null;
    let cancelled = false;
    import("page-flip").then(({ PageFlip }) => {
      if (cancelled) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      pf = new PageFlip(book, {
        width: 420,
        height: 594,
        size: "stretch",
        minWidth: 240,
        maxWidth: 560,
        minHeight: 340,
        maxHeight: 792,
        showCover: true,
        usePortrait: true,
        mobileScrollSupport: true,
        maxShadowOpacity: 0.4,
        flippingTime: reduce ? 1 : 800,
        drawShadow: !reduce,
      });
      pf.loadFromHTML(els);
      pf.on("flip", (e) => setCurrent(Number(e.data)));
      pf.on("changeOrientation", (e) => setPortrait(e.data === "portrait"));
      setPortrait(pf.getOrientation() === "portrait");
      flipRef.current = pf;
    });
    return () => {
      cancelled = true;
      flipRef.current = null;
      setSlots([]);
      try {
        pf?.destroy();
      } catch {
        // Уже прибрано.
      }
      host.replaceChildren();
    };
  }, [count]);

  const go = useCallback((delta: number) => {
    const pf = flipRef.current;
    if (!pf) return;
    if (delta > 0) pf.flipNext();
    else pf.flipPrev();
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      if (el && ["INPUT", "TEXTAREA", "SELECT"].includes(el.tagName)) return;
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go]);

  // Номери сторінок як у друкованій книжці: обкладинка — 1, титул — 2, історія — 3…
  const last = count - 1;
  const label =
    current === 0
      ? "Обкладинка"
      : current === last
        ? "Кінець"
        : portrait || current + 1 >= last
          ? `Сторінка ${current + 1} з ${printTotal}`
          : `Сторінки ${current + 1}–${current + 2} з ${printTotal}`;

  function content(i: number): ReactNode {
    if (i === 0) {
      return (
        <div className="flip-cover">
          <Art scene={cover} image={coverImage} eager />
          <h2 className="cover-title">{title}</h2>
        </div>
      );
    }
    if (i === 1) {
      return (
        <div className="flip-title">
          <Kvitka size={44} />
          <p className="cover-title">{title}</p>
          <p className="cover-dedication">{dedication}</p>
          <span className="page-no">2</span>
        </div>
      );
    }
    if (i === last) {
      return (
        <div className="flip-back">
          <BackCover background={coverImage?.src} />
        </div>
      );
    }
    const n = i - 2;
    const page = pages[n];
    const locked = lockedFrom !== undefined && n >= lockedFrom;
    return (
      <div className={`flip-story ${locked ? "is-locked" : ""}`}>
        <div className="flip-art">
          <Art scene={page.scene} image={page.image} eager={n < 2} />
        </div>
        <div className={`flip-text ${sizeClass}`}>
          <p className="story-text">{page.text}</p>
        </div>
        <span className="page-no">{i + 1}</span>
        {locked && <div className="lock-overlay">{lockedMessage}</div>}
      </div>
    );
  }

  return (
    <div className={`reader ${fontClass}`}>
      <div className="flip-stage">
        <div ref={hostRef} className="flip-host" />
      </div>
      {slots.map((el, i) => createPortal(content(i), el, `p${i}`))}

      <div className="reader-nav">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => go(-1)}
          disabled={current === 0}
          aria-label="Попередня сторінка"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="nav-word">Назад</span>
        </button>
        <div>
          <div className="reader-count" aria-live="polite">
            {label}
          </div>
          <div className="reader-progress" aria-hidden="true">
            <span style={{ width: `${((current + 1) / count) * 100}%` }} />
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => go(1)}
          disabled={current >= last - (portrait ? 0 : 1)}
          aria-label="Наступна сторінка"
        >
          <span className="nav-word">Далі</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="hint" style={{ textAlign: "center" }}>
        Гортайте, потягнувши за край сторінки, або кнопками «Назад» і «Далі».
      </p>
    </div>
  );
}

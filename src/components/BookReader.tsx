"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import type { Illustration, SceneId } from "@/lib/types";
import { Kvitka } from "./Ornament";
import Scene from "./Scene";

type Props = {
  title: string;
  dedication: string;
  cover: SceneId;
  coverImage?: Illustration;
  pages: { text: string; scene: SceneId; image?: Illustration }[];
  /** Сторінки з цим індексом і далі показуються розмитими. */
  lockedFrom?: number;
  lockedMessage?: ReactNode;
};

export default function BookReader({ title, dedication, cover, coverImage, pages, lockedFrom, lockedMessage }: Props) {
  // 0 — обкладинка, далі сторінки казки
  const [[spread, dir], setSpread] = useState<[number, number]>([0, 0]);
  const total = pages.length + 1;
  const reduce = useReducedMotion();

  const go = useCallback(
    (delta: number) =>
      setSpread(([s]) => {
        const next = Math.min(total - 1, Math.max(0, s + delta));
        return [next, next === s ? 0 : delta];
      }),
    [total],
  );

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

  const page = spread > 0 ? pages[spread - 1] : null;
  const locked = page !== null && lockedFrom !== undefined && spread - 1 >= lockedFrom;
  const image = page ? page.image : coverImage;
  const hasImages = Boolean(coverImage || pages.some((p) => p.image));
  const offset = reduce ? 0 : 40;

  return (
    <div className="reader">
      <AnimatePresence mode="wait" initial={false} custom={dir}>
        <motion.div
          key={spread}
          className={`reader-book ${hasImages ? "has-images" : ""}`}
          aria-live="polite"
          custom={dir}
          initial={{ opacity: 0, x: dir * offset }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -dir * offset }}
          transition={{ duration: reduce ? 0 : 0.22, ease: "easeOut" }}
          drag={reduce ? false : "x"}
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={0.18}
          onDragEnd={(_, info) => {
            if (info.offset.x < -60) go(1);
            else if (info.offset.x > 60) go(-1);
          }}
          style={{ touchAction: "pan-y" }}
        >
          <div className="reader-art">
            {image ? (
              <Image
                src={image.src}
                width={image.width}
                height={image.height}
                alt=""
                className="reader-img"
                priority={spread === 0}
                unoptimized={image.src.startsWith("blob:")}
                draggable={false}
                sizes="(max-width: 760px) 100vw, 460px"
              />
            ) : (
              <Scene id={page ? page.scene : cover} />
            )}
          </div>
          <div className={`reader-text ${locked ? "is-locked" : ""}`}>
            {page ? (
              <>
                <p className="story-text">{page.text}</p>
                <span className="page-no">{spread}</span>
                {locked && <div className="lock-overlay">{lockedMessage}</div>}
              </>
            ) : (
              <div className="reader-cover">
                <Kvitka size={44} />
                <h2 className="cover-title">{title}</h2>
                <p className="cover-dedication">{dedication}</p>
              </div>
            )}
          </div>
        </motion.div>
      </AnimatePresence>

      <div className="reader-nav">
        <button
          type="button"
          className="btn btn-ghost btn-small"
          onClick={() => go(-1)}
          disabled={spread === 0}
          aria-label="Попередня сторінка"
        >
          <ChevronLeft size={18} aria-hidden="true" />
          <span className="nav-word">Назад</span>
        </button>
        <div>
          <div className="reader-count">
            {spread === 0 ? "Обкладинка" : `Сторінка ${spread} з ${pages.length}`}
          </div>
          <div className="reader-dots" aria-hidden="true">
            {Array.from({ length: total }, (_, i) => (
              <span key={i} className={i === spread ? "is-on" : ""} />
            ))}
          </div>
        </div>
        <button
          type="button"
          className="btn btn-primary btn-small"
          onClick={() => go(1)}
          disabled={spread === total - 1}
          aria-label="Наступна сторінка"
        >
          <span className="nav-word">Далі</span>
          <ChevronRight size={18} aria-hidden="true" />
        </button>
      </div>
      <p className="hint" style={{ textAlign: "center" }}>
        На телефоні гортайте пальцем, на комп&apos;ютері — стрілками.
      </p>
    </div>
  );
}

"use client";

import Image from "next/image";
import { useCallback, useEffect, useState, type ReactNode } from "react";
import Scene from "./Scene";
import type { Illustration, SceneId } from "@/lib/types";

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
  const [spread, setSpread] = useState(0);
  const total = pages.length + 1;

  const go = useCallback(
    (delta: number) => setSpread((s) => Math.min(total - 1, Math.max(0, s + delta))),
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

  return (
    <div className="reader">
      <div className={`reader-book ${hasImages ? "has-images" : ""}`} aria-live="polite">
        <div className="reader-art">
          {image ? (
            <Image
              key={image.src}
              src={image.src}
              width={image.width}
              height={image.height}
              alt=""
              className="reader-img"
              priority={spread === 0}
              sizes="(max-width: 760px) 100vw, 480px"
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
              <h2 className="cover-title">{title}</h2>
              <p className="cover-dedication">{dedication}</p>
            </div>
          )}
        </div>
      </div>

      <div className="reader-nav">
        <button type="button" className="btn btn-ghost" onClick={() => go(-1)} disabled={spread === 0}>
          Назад
        </button>
        <span className="reader-count">
          {spread === 0 ? "Обкладинка" : `Сторінка ${spread} з ${pages.length}`}
        </span>
        <button type="button" className="btn btn-ghost" onClick={() => go(1)} disabled={spread === total - 1}>
          Далі
        </button>
      </div>
    </div>
  );
}

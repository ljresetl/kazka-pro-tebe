"use client";

// Розмальовка з ілюстрації: браузер знаходить краї (оператор Собеля) і малює їх
// чорними лініями на білому. Безкоштовно й миттєво — без ШІ.

const MAX = 1024;
const STRONG = 70;
const SOFT = 40;

function load(src: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

/** Повертає PNG (data URL) з контурами картинки. */
export async function lineArt(src: string): Promise<string> {
  const img = await load(src);
  const scale = Math.min(1, MAX / Math.max(img.naturalWidth, img.naturalHeight));
  const w = Math.round(img.naturalWidth * scale);
  const h = Math.round(img.naturalHeight * scale);
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d", { willReadFrequently: true })!;
  // Легке розмиття прибирає дрібні текстури, щоб лишилися головні лінії.
  ctx.filter = "grayscale(1) blur(1.2px)";
  ctx.drawImage(img, 0, 0, w, h);
  const pixels = ctx.getImageData(0, 0, w, h);
  const d = pixels.data;
  const gray = new Uint8ClampedArray(w * h);
  for (let i = 0; i < w * h; i++) gray[i] = d[i * 4];

  const out = ctx.createImageData(w, h);
  const o = out.data;
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      let v = 255;
      if (x > 0 && y > 0 && x < w - 1 && y < h - 1) {
        const p = (dx: number, dy: number) => gray[(y + dy) * w + x + dx];
        const gx = -p(-1, -1) - 2 * p(-1, 0) - p(-1, 1) + p(1, -1) + 2 * p(1, 0) + p(1, 1);
        const gy = -p(-1, -1) - 2 * p(0, -1) - p(1, -1) + p(-1, 1) + 2 * p(0, 1) + p(1, 1);
        const m = Math.hypot(gx, gy);
        v = m > STRONG ? 0 : m > SOFT ? 150 : 255;
      }
      const i = (y * w + x) * 4;
      o[i] = o[i + 1] = o[i + 2] = v;
      o[i + 3] = 255;
    }
  }
  ctx.filter = "none";
  ctx.putImageData(out, 0, 0);
  return canvas.toDataURL("image/png");
}

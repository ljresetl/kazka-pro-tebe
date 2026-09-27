"use client";

import { Check, Copy } from "lucide-react";
import { useState } from "react";

/** Копіює текст (опис для генерації картинки) у буфер обміну. */
export default function CopyButton({ text, label = "Копіювати опис" }: { text: string; label?: string }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="copy-btn"
      onClick={async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
          await navigator.clipboard.writeText(text);
        } catch {
          // Старі браузери: виділяємо текст, щоб скопіювати вручну.
          window.prompt("Скопіюйте опис:", text);
        }
        setDone(true);
        setTimeout(() => setDone(false), 1800);
      }}
    >
      {done ? <Check size={15} aria-hidden="true" /> : <Copy size={15} aria-hidden="true" />}
      {done ? "Скопійовано" : label}
    </button>
  );
}

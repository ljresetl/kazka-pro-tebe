"use client";

import { useEffect } from "react";

// Захист текстів і картинок від копіювання й скріншотів на комп'ютері:
// - не працюють виділення, копіювання, «Зберегти картинку», перетягування, Ctrl+S і Ctrl+U;
// - Print Screen: одразу очищаємо буфер обміну й ненадовго розмиваємо сторінку;
// - коли вікно втрачає фокус (Win+Shift+S, «Ножиці», інші програми для скріншотів) або вкладку
//   ховають — вміст розмивається, поки людина не повернеться.
// Скріншот кнопками телефона браузер не бачить — його не заблокує жоден сайт.
// У полях форм (ім'я, редактор казки) усе працює як завжди.

const EDITABLE = "input, textarea, select, [contenteditable='true'], .allow-copy";
const HIDE = "guard-hide";

function editable(target: EventTarget | null) {
  return target instanceof Element && Boolean(target.closest(EDITABLE));
}

export default function ContentGuard() {
  useEffect(() => {
    const root = document.documentElement;
    let timer: ReturnType<typeof setTimeout> | undefined;
    const hide = () => root.classList.add(HIDE);
    const show = () => {
      if (document.hasFocus() && document.visibilityState === "visible") root.classList.remove(HIDE);
    };

    const block = (e: Event) => {
      if (!editable(e.target)) e.preventDefault();
    };
    const onKey = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      const mod = e.ctrlKey || e.metaKey;
      if (key === "printscreen") {
        hide();
        navigator.clipboard?.writeText("").catch(() => {});
        clearTimeout(timer);
        timer = setTimeout(show, 1500);
        return;
      }
      // Ctrl+S (зберегти сторінку), Ctrl+U (код сторінки). Друк лишаємо: для нього є кнопки й водяний знак.
      if (mod && (key === "s" || key === "u")) e.preventDefault();
      if (mod && (key === "c" || key === "x" || key === "a") && !editable(e.target)) e.preventDefault();
      // Win+Shift+S / Cmd+Shift+3/4/5 — ховаємо вміст ще до того, як відкриються «Ножиці».
      if (e.shiftKey && (e.metaKey || key === "meta") && ["s", "3", "4", "5"].includes(key)) hide();
    };
    const onVisibility = () => (document.visibilityState === "hidden" ? hide() : show());

    const events = ["copy", "cut", "contextmenu", "dragstart", "selectstart"] as const;
    events.forEach((t) => document.addEventListener(t, block));
    document.addEventListener("keydown", onKey);
    document.addEventListener("keyup", onKey);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("blur", hide);
    window.addEventListener("focus", show);
    return () => {
      clearTimeout(timer);
      events.forEach((t) => document.removeEventListener(t, block));
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("keyup", onKey);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("blur", hide);
      window.removeEventListener("focus", show);
      root.classList.remove(HIDE);
    };
  }, []);
  return null;
}

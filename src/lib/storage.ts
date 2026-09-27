"use client";

import { useMemo, useSyncExternalStore } from "react";
import type { Story } from "./types";

// Поки немає бекенду й акаунтів, казки зберігаються в браузері покупця.

const KEY = (id: string) => `kazka:story:${id}`;
const EVENT = "kazka:storage";

function read(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveStory(story: Story) {
  try {
    window.localStorage.setItem(KEY(story.id), JSON.stringify(story));
    const ids = listIds().filter((i) => i !== story.id);
    window.localStorage.setItem("kazka:ids", JSON.stringify([story.id, ...ids].slice(0, 50)));
  } catch {
    // Приватний режим або переповнене сховище — казка просто не збережеться.
  }
  window.dispatchEvent(new Event(EVENT));
}

function listIds(): string[] {
  try {
    return JSON.parse(read("kazka:ids") ?? "[]");
  } catch {
    return [];
  }
}

function subscribe(cb: () => void) {
  window.addEventListener("storage", cb);
  window.addEventListener(EVENT, cb);
  return () => {
    window.removeEventListener("storage", cb);
    window.removeEventListener(EVENT, cb);
  };
}

/** undefined — ще не прочитали (сервер), null — казки немає. */
export function useStory(id: string): Story | null | undefined {
  const raw = useSyncExternalStore(
    subscribe,
    () => read(KEY(id)) ?? "",
    () => undefined,
  );
  return useMemo(() => {
    if (raw === undefined) return undefined;
    if (!raw) return null;
    try {
      return JSON.parse(raw) as Story;
    } catch {
      return null;
    }
  }, [raw]);
}

export function markPaid(story: Story) {
  saveStory({ ...story, paid: true });
}

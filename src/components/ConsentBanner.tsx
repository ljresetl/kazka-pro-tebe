"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

// Згода на обробку персональних даних.
// Показується при першому відвідуванні й знову, якщо змінилася політика
// (тоді треба збільшити CONSENT_VERSION). Кукі й аналітики сайт не використовує.
const CONSENT_VERSION = "2026-09-28";
const KEY = "kazka:consent";
const EVENT = "kazka:consent";

function read() {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === CONSENT_VERSION || v === `declined:${CONSENT_VERSION}`;
  } catch {
    return false;
  }
}

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

export default function ConsentBanner() {
  // На сервері вважаємо, що згоду вже дано, — банер з'являється лише в браузері.
  const accepted = useSyncExternalStore(subscribe, read, () => true);
  if (accepted) return null;

  function choose(value: string) {
    try {
      window.localStorage.setItem(KEY, value);
    } catch {
      // Приватний режим — банер з'явиться знову при наступному заході.
    }
    window.dispatchEvent(new Event(EVENT));
  }

  return (
    <div className="consent" role="dialog" aria-live="polite" aria-labelledby="consent-title">
      <ShieldCheck size={24} aria-hidden="true" className="consent-icon" />
      <div className="consent-text">
        <p id="consent-title">
          <strong>Ваші дані в безпеці.</strong> Казкарня не використовує рекламних і аналітичних кукі. Ім&apos;я та
          інші дані, які ви вводите, потрібні лише, щоб створити книжку й виконати замовлення, а книжки зберігаються у
          вашому браузері. Детальніше — у{" "}
          <Link href="/konfidentsiinist">політиці конфіденційності</Link>.
        </p>
      </div>
      <div className="consent-actions">
        <button type="button" className="btn btn-ghost btn-small" onClick={() => choose(`declined:${CONSENT_VERSION}`)}>
          Відхилити
        </button>
        <button type="button" className="btn btn-primary btn-small" onClick={() => choose(CONSENT_VERSION)}>
          Прийняти
        </button>
      </div>
    </div>
  );
}

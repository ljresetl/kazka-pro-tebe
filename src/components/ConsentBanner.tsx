"use client";

import { ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";

// Згода на обробку персональних даних.
// Показується при першому відвідуванні й знову, якщо змінилася політика
// (тоді треба збільшити CONSENT_VERSION). Кукі й аналітики сайт не використовує.
const CONSENT_VERSION = "2026-09-27";
const KEY = "kazka:consent";
const EVENT = "kazka:consent";

function read() {
  try {
    return window.localStorage.getItem(KEY) === CONSENT_VERSION;
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

  function accept() {
    try {
      window.localStorage.setItem(KEY, CONSENT_VERSION);
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
          <strong>Ваші дані в безпеці.</strong> Ми використовуємо ім&apos;я та інші дані, які ви вводите, лише щоб
          створити казку й виконати замовлення. Казки зберігаються у вашому браузері. Детальніше — у{" "}
          <Link href="/konfidentsiinist">політиці конфіденційності</Link>.
        </p>
      </div>
      <button type="button" className="btn btn-primary btn-small" onClick={accept}>
        Погоджуюсь
      </button>
    </div>
  );
}

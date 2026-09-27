"use client";

import { useState, useSyncExternalStore } from "react";

const noop = () => () => {};

type Props = {
  /** Повна адреса сторінки, якою ділимося. */
  url: string;
  title: string;
  text?: string;
  label?: string;
};

/**
 * Кнопки «Поділитися»: на телефоні — системне меню (Viber, Telegram, Instagram…),
 * поруч — прямі посилання для комп'ютера й кнопка «Скопіювати посилання».
 */
export default function ShareButtons({ url, title, text, label = "Поділитися" }: Props) {
  const [copied, setCopied] = useState(false);
  const message = text ? `${text} ${url}` : url;
  const e = encodeURIComponent;

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {
      // Людина закрила меню — нічого не робимо.
    }
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt("Скопіюйте посилання:", url);
    }
  }

  // Системне меню «Поділитися» є лише в браузері (переважно на телефонах).
  const canShare = useSyncExternalStore(
    noop,
    () => "share" in navigator,
    () => false,
  );

  return (
    <div className="share" aria-label={label}>
      <p className="share-label">{label}</p>
      <div className="share-row">
        {canShare && (
          <button type="button" className="share-btn is-main" onClick={nativeShare}>
            <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6"
                stroke="currentColor"
                strokeWidth="2"
                fill="none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Надіслати
          </button>
        )}
        <a
          className="share-btn"
          href={`https://t.me/share/url?url=${e(url)}&text=${e(text ?? title)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Telegram
        </a>
        <a className="share-btn" href={`viber://forward?text=${e(message)}`}>
          Viber
        </a>
        <a
          className="share-btn"
          href={`https://www.facebook.com/sharer/sharer.php?u=${e(url)}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          Facebook
        </a>
        <button type="button" className="share-btn" onClick={copy} aria-live="polite">
          {copied ? "Скопійовано ✓" : "Скопіювати посилання"}
        </button>
      </div>
    </div>
  );
}

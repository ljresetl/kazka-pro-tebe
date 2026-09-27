// Дані власника сайту. Їх показують сторінки «Контакти», «Оферта»,
// «Конфіденційність» і підвал. Платіжні системи (LiqPay, WayForPay,
// monobank) вимагають, щоб ці дані були на сайті ДО підключення оплати.
// Порожні поля на сайті не показуються.

export const SITE = {
  name: "Казкарня",
  tagline: "Казка, де головний герой — твоя дитина",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://kazka-pro-tebe.vercel.app",
  description:
    "Іменні казки українською, де головний герой — ваша дитина. Безкоштовний перегляд, PDF для друку вдома або книжка в палітурці.",

  /** Повна назва продавця, напр. «ФОП Петренко Олена Іванівна». */
  sellerName: "",
  /** РНОКПП (ІПН) або ЄДРПОУ. */
  sellerCode: "",
  /** Юридична адреса. */
  sellerAddress: "",
  /** Пошта для листів і чеків. */
  email: "",
  /** Телефон у форматі +380XXXXXXXXX. */
  phone: "",
  /** Посилання на Instagram, Telegram тощо. */
  instagram: "",
  telegram: "",
};

export const hasSellerDetails = Boolean(SITE.sellerName && SITE.sellerCode && SITE.email);

/** Повна адреса сторінки для canonical, Open Graph і sitemap. */
export function abs(path = "/") {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (clean === "/") return `${SITE.url}/`;
  // Статична версія (GitHub Pages) має адреси зі скісною рискою в кінці, серверна (Vercel) — без неї.
  const trailing = process.env.NEXT_PUBLIC_STATIC_SITE === "1";
  const bare = clean.replace(/\/+$/, "");
  return `${SITE.url}${trailing ? `${bare}/` : bare}`;
}

/** Адреса файлу з public/ з урахуванням підпапки сайту. */
export function asset(path: string) {
  return `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}${path}`;
}

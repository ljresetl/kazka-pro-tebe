import type { Metadata } from "next";
import { INDEXING, abs, SITE } from "./site";

/** Повна адреса файлу (картинки) без кінцевого слеша. */
export function absFile(path: string) {
  return `${SITE.url}${path.startsWith("/") ? path : `/${path}`}`;
}

export const OG_IMAGE = {
  url: absFile("/og.jpg"),
  width: 1200,
  height: 630,
  alt: `${SITE.name} — іменні казки українською для дітей`,
};

type PageMetaInput = {
  title: string;
  description: string;
  /** Шлях сторінки без підпапки сайту, напр. "/pryklady". */
  path: string;
  image?: { url: string; width: number; height: number; alt: string };
  /** Сторінки, яких не має бути в пошуку (особисті казки, оплата). */
  noindex?: boolean;
  type?: "website" | "article" | "book";
};

/** Повний набір метатегів для сторінки: title, description, canonical, Open Graph, Twitter. */
export function pageMeta({ title, description, path, image, noindex, type = "website" }: PageMetaInput): Metadata {
  const url = abs(path);
  const img = image ?? OG_IMAGE;
  return {
    title: { absolute: title.includes(SITE.name) ? title : `${title} — ${SITE.name}` },
    description,
    alternates: { canonical: url },
    openGraph: {
      type: type === "book" ? "book" : type === "article" ? "article" : "website",
      url,
      title,
      description,
      siteName: SITE.name,
      locale: "uk_UA",
      images: [img],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [img.url],
    },
    robots: !INDEXING ? { index: false, follow: false } : noindex ? { index: false, follow: true } : undefined,
  };
}

/** Вбудовує структуровані дані schema.org у сторінку. */
export function jsonLd(data: object) {
  return { __html: JSON.stringify(data).replace(/</g, "\\u003c") };
}

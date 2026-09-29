import type { NextConfig } from "next";

// GITHUB_PAGES=1 — статична збірка для GitHub Pages (без сервера, у підпапці репозиторію).
const isPages = process.env.GITHUB_PAGES === "1";
const basePath = isPages ? (process.env.PAGES_BASE_PATH ?? "") : "";

// Головна адреса сайту (для canonical, Open Graph, sitemap).
// На Vercel береться його продакшн-домен; можна перевизначити NEXT_PUBLIC_SITE_URL.
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "") ||
  "https://kazka-pro-tebe.vercel.app";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export", trailingSlash: true } : {}),
  basePath,
  images: { unoptimized: isPages },
  // Поки сайт закритий від індексації (INDEXING у src/lib/site.ts), Vercel додає заголовок noindex до всього.
  // Відкриваючи сайт для пошуку, приберіть і цей блок.
  ...(isPages
    ? {}
    : { headers: async () => [{ source: "/:path*", headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }] }] }),
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
    NEXT_PUBLIC_STATIC_SITE: isPages ? "1" : "",
  },
};

export default nextConfig;

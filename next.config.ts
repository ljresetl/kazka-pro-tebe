import type { NextConfig } from "next";

// GITHUB_PAGES=1 — статична збірка для GitHub Pages (без сервера, у підпапці репозиторію).
const isPages = process.env.GITHUB_PAGES === "1";
const basePath = isPages ? (process.env.PAGES_BASE_PATH ?? "") : "";

const nextConfig: NextConfig = {
  ...(isPages ? { output: "export", trailingSlash: true } : {}),
  basePath,
  images: { unoptimized: isPages },
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_STATIC_SITE: isPages ? "1" : "",
  },
};

export default nextConfig;

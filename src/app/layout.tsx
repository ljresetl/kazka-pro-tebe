import type { Metadata, Viewport } from "next";
import { Nunito } from "next/font/google";
import ConsentBanner from "@/components/ConsentBanner";
import ContentGuard from "@/components/ContentGuard";
import SiteFooter from "@/components/SiteFooter";
import PromoBar from "@/components/PromoBar";
import SiteHeader from "@/components/SiteHeader";
import { jsonLd, OG_IMAGE } from "@/lib/seo";
import { abs, INDEXING, SITE } from "@/lib/site";
import "./globals.css";
import "./design.css";
import "./seo-pages.css";

// Nunito — округлий шрифт з повною кирилицею: і для заголовків, і для тексту.
const nunito = Nunito({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "600", "700", "800", "900"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Персональна дитяча книжка з ім'ям дитини — ${SITE.name}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  robots: INDEXING ? undefined : { index: false, follow: false },
  keywords: [
    "іменна казка",
    "персоналізована книга для дитини",
    "казка з ім'ям дитини",
    "іменна книга",
    "подарунок дитині",
    "казки українською",
    "казка для друку pdf",
  ],
  alternates: { canonical: abs("/") },
  openGraph: {
    type: "website",
    url: abs("/"),
    siteName: SITE.name,
    locale: "uk_UA",
    title: "Персональна дитяча книжка з ім'ям дитини",
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fff8ee",
};

const orgLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  url: abs("/"),
  logo: `${SITE.url}/icon.svg`,
  ...(SITE.email ? { email: SITE.email } : {}),
  ...(SITE.phone ? { telephone: SITE.phone } : {}),
  sameAs: [SITE.instagram, SITE.telegram].filter(Boolean),
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="uk" data-scroll-behavior="smooth" className={nunito.variable}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(orgLd)} />
        <PromoBar />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ConsentBanner />
        <ContentGuard />
      </body>
    </html>
  );
}

import type { Metadata, Viewport } from "next";
import { Onest, Unbounded } from "next/font/google";
import ConsentBanner from "@/components/ConsentBanner";
import SiteFooter from "@/components/SiteFooter";
import SiteHeader from "@/components/SiteHeader";
import { jsonLd, OG_IMAGE } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";
import "./globals.css";

// Обидва шрифти створені українськими дизайнерами й мають повну кирилицю.
const unbounded = Unbounded({
  variable: "--font-display",
  subsets: ["latin", "cyrillic"],
  weight: ["600", "700"],
  display: "swap",
});

const onest = Onest({
  variable: "--font-body",
  subsets: ["latin", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: `Іменна казка для дитини українською — ${SITE.name}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
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
    title: "Іменна казка для дитини українською",
    description: SITE.description,
    images: [OG_IMAGE],
  },
  twitter: { card: "summary_large_image", images: [OG_IMAGE.url] },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#f6f8fe",
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
    <html lang="uk" data-scroll-behavior="smooth" className={`${unbounded.variable} ${onest.variable}`}>
      <body>
        <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(orgLd)} />
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <ConsentBanner />
      </body>
    </html>
  );
}

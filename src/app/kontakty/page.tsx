import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import SellerDetails from "@/components/SellerDetails";
import ContactForm from "./ContactForm";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Контакти",
  description: `Як зв'язатися з ${SITE.name}: питання про казки, замовлення, друк і доставку.`,
  path: "/kontakty",
});

export default function ContactsPage() {
  const channels = [
    SITE.email && { label: "Пошта", href: `mailto:${SITE.email}`, text: SITE.email },
    SITE.phone && { label: "Телефон", href: `tel:${SITE.phone}`, text: SITE.phone },
    SITE.telegram && { label: "Telegram", href: SITE.telegram, text: "Написати в Telegram" },
    SITE.instagram && { label: "Instagram", href: SITE.instagram, text: "Instagram" },
  ].filter(Boolean) as { label: string; href: string; text: string }[];

  return (
    <InfoPage title="Контакти">
      <p>Маєте питання, зауваження чи ідеї? Пишіть нам — ми завжди на зв&apos;язку й відповідаємо в робочі дні.</p>
      <ContactForm />

      {channels.length > 0 && (
        <>
          <h2>Інші способи зв&apos;язку</h2>
          <ul>
            {channels.map((c) => (
              <li key={c.label}>
                <strong>{c.label}:</strong> <a href={c.href}>{c.text}</a>
              </li>
            ))}
          </ul>
        </>
      )}

      <h2>Реквізити</h2>
      <SellerDetails />

      <h2>Корисне</h2>
      <ul>
        <li>
          <Link href="/dostavka-i-oplata">Доставка й оплата</Link>
        </li>
        <li>
          <Link href="/umovy">Публічна оферта</Link>
        </li>
        <li>
          <Link href="/konfidentsiinist">Політика конфіденційності</Link>
        </li>
      </ul>
    </InfoPage>
  );
}

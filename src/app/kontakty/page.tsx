import type { Metadata } from "next";
import Link from "next/link";
import InfoPage from "@/components/InfoPage";
import SellerDetails from "@/components/SellerDetails";
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
      <p>
        Маєте питання про казку, замовлення чи доставку? Напишіть нам — відповідаємо в робочі дні протягом доби.
      </p>

      {channels.length > 0 ? (
        <ul>
          {channels.map((c) => (
            <li key={c.label}>
              <strong>{c.label}:</strong> <a href={c.href}>{c.text}</a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="notice is-info">Контакти для зв&apos;язку з&apos;являться тут найближчим часом.</p>
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

import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Авторські права й ліцензії",
  description: `Звідки на сайті ${SITE.name} ілюстрації, іконки й шрифти та за якими ліцензіями вони використовуються.`,
  path: "/litsenzii",
});

export default function LicensesPage() {
  return (
    <InfoPage title="Авторські права й ліцензії" updated="29 вересня 2026 року">
      <p>
        Тексти, історії й дизайн сайту {SITE.name} створені нами. Нижче — звідки на сайті ілюстрації й шрифти.
      </p>

      <h2>Ілюстрації сайту</h2>
      <p>
        Ілюстрації сайту (головна сторінка, теми, обкладинки з іменами, статті блогу, приклади) ми створили за
        власними описами за допомогою штучного інтелекту Google Gemini. Фото дітей на сторінці прикладів теж
        згенеровані й зображають вигаданих дітей; обкладинки прикладів намальовані з цих фото нашим конструктором.
      </p>

      <h2>Шрифти</h2>
      <p>
        <strong>Nunito</strong> та інші шрифти книжок (Alegreya, Comfortaa, Rubik Bubbles, Pacifico, Russo One, Caveat,
        Neucha, Roboto Slab) — з колекції Google Fonts, ліцензія SIL Open Font License 1.1.{" "}
        <a href="https://openfontlicense.org" rel="noopener">
          openfontlicense.org
        </a>
      </p>

      <h2>Ілюстрації в книжках покупців</h2>
      <p>
        Ілюстрації до персональних книжок створює штучний інтелект спеціально для кожної книжки. Покупець може
        використовувати свою книжку для особистих і сімейних потреб (див. <a href="/umovy">публічну оферту</a>).
      </p>
    </InfoPage>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import BackLink from "@/components/BackLink";
import { OrnamentRule } from "@/components/Ornament";
import SeoText from "@/components/SeoText";
import { pageMeta } from "@/lib/seo";
import LibraryList from "./LibraryList";

export const metadata: Metadata = pageMeta({
  title: "Українські казки для дітей читати онлайн безкоштовно",
  description:
    "Повні тексти українських народних казок: «Рукавичка», «Колобок», «Коза-дереза» та інші. Читайте онлайн з ілюстраціями і друкуйте безкоштовно.",
  path: "/biblioteka",
});

export default function LibraryPage() {
  return (
    <>
      <div className="wrap" style={{ paddingBottom: 32 }}>
        <div className="back-row">
          <BackLink fallback="/" />
        </div>
        <div className="page-top">
          <OrnamentRule className="ornament-rule" />
          <h1>Безкоштовні казки</h1>
          <p>Українські народні казки в нашому переказі та авторські історії. Повні тексти, читайте з екрана або друкуйте — безкоштовно. Бібліотека поповнюється щотижня.</p>
        </div>
        <Suspense fallback={null}>
          <LibraryList />
        </Suspense>
      </div>

      <SeoText title="Народні казки — перша бібліотека дитини">
        <div>
          <p>
            Українські народні казки передавалися з вуст в уста століттями, і кожне покоління додавало щось своє. Саме
            тому вони такі впізнавані: повтори, приспівки, звірі з двома іменами — «мишка-шкряботушка»,
            «лисичка-сестричка». Для малюка це не просто історія, а гра в слова.
          </p>
          <p>
            Казки про тварин, як «Рукавичка» чи «Колобок», найкраще підходять дітям 2–5 років: сюжет простий, герої
            повторюються, а кінцівку дитина вгадує заздалегідь — і дуже цим пишається.
          </p>
        </div>
        <div>
          <p>
            Ми переказуємо народні казки сучасною, але живою мовою: без застарілих слів, які довелося б пояснювати, і
            без спрощень, що вбивають чарівність оригіналу. Авторські казки пишемо в тій самій традиції.
          </p>
          <p>
            Усі казки в бібліотеці можна читати й друкувати безкоштовно — зокрема як розмальовку, щоб дитина
            розфарбувала ілюстрації сама.
          </p>
        </div>
      </SeoText>
    </>
  );
}

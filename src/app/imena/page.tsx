import type { Metadata } from "next";
import NamesList, { NAMES_PER_PAGE } from "@/components/seo/NamesList";
import { NAMES } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Улюблені імена для дитячих книжок",
  description: `Ідеї персональних книжок для ${NAMES.length} популярних українських імен — від Адама до Ярослави. Оберіть ім'я й подивіться, якою може бути книжка для вашої дитини.`,
  path: "/imena",
});

export default function NamesPage() {
  return (
    <NamesList
      title="Улюблені імена для дитячих книжок"
      lead="Шукаєте персональну дитячу книжку для конкретного імені? Нижче — ідеї книжок для найпопулярніших українських імен."
      names={NAMES.slice(0, NAMES_PER_PAGE)}
      page={1}
      pages={Math.ceil(NAMES.length / NAMES_PER_PAGE)}
      crumbs={[{ name: "Імена", path: "/imena" }]}
      withAbout
    />
  );
}

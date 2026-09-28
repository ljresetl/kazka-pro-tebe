import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NamesList from "@/components/seo/NamesList";
import { letterFromSlug, letterSlug, NAME_LETTERS, namesByLetter } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return NAME_LETTERS.map((l) => ({ l: letterSlug(l) }));
}

export async function generateMetadata(props: PageProps<"/imena/litera/[l]">): Promise<Metadata> {
  const { l } = await props.params;
  const letter = letterFromSlug(l);
  if (!letter) return {};
  const list = namesByLetter(letter);
  return pageMeta({
    title: `Дитячі імена на літеру ${letter}`,
    description: `Персональні дитячі книжки для імен на «${letter}»: ${list
      .slice(0, 6)
      .map((n) => n.name)
      .join(", ")} та інших. Оберіть ім'я й створіть книжку, де дитина — головний герой.`,
    path: `/imena/litera/${l}`,
  });
}

export default async function LetterPage(props: PageProps<"/imena/litera/[l]">) {
  const { l } = await props.params;
  const letter = letterFromSlug(l);
  if (!letter) notFound();
  return (
    <NamesList
      title={`Дитячі імена на літеру ${letter}`}
      lead="Шукаєте персональну дитячу книжку для конкретного імені? Нижче — ідеї книжок для найпопулярніших імен на цю літеру."
      names={namesByLetter(letter)}
      letter={letter}
      crumbs={[
        { name: "Імена", path: "/imena" },
        { name: `Літера ${letter}`, path: `/imena/litera/${l}` },
      ]}
    />
  );
}

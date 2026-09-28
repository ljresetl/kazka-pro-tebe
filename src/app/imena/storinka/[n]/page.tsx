import type { Metadata } from "next";
import { notFound } from "next/navigation";
import NamesList, { NAMES_PER_PAGE } from "@/components/seo/NamesList";
import { NAMES } from "@/lib/pages/names";
import { pageMeta } from "@/lib/seo";

const PAGES = Math.ceil(NAMES.length / NAMES_PER_PAGE);

export function generateStaticParams() {
  return Array.from({ length: PAGES - 1 }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata(props: PageProps<"/imena/storinka/[n]">): Promise<Metadata> {
  const { n } = await props.params;
  return pageMeta({
    title: `Улюблені імена для дитячих книжок — сторінка ${n}`,
    description: `Ідеї персональних книжок для українських імен, сторінка ${n} з ${PAGES}.`,
    path: `/imena/storinka/${n}`,
  });
}

export default async function NamesPageN(props: PageProps<"/imena/storinka/[n]">) {
  const { n } = await props.params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > PAGES) notFound();
  return (
    <NamesList
      title={`Улюблені імена для дитячих книжок — сторінка ${page}`}
      lead="Шукаєте персональну дитячу книжку для конкретного імені? Нижче — ідеї книжок для найпопулярніших українських імен."
      names={NAMES.slice((page - 1) * NAMES_PER_PAGE, page * NAMES_PER_PAGE)}
      page={page}
      pages={PAGES}
      crumbs={[
        { name: "Імена", path: "/imena" },
        { name: `Сторінка ${page}`, path: `/imena/storinka/${page}` },
      ]}
    />
  );
}

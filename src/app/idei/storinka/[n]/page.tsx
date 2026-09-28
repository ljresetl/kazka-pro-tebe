import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IdeasList from "@/components/seo/IdeasList";
import { IDEAS, IDEAS_PER_PAGE } from "@/lib/pages/ideas";
import { pageMeta } from "@/lib/seo";

const PAGES = Math.ceil(IDEAS.length / IDEAS_PER_PAGE);

export function generateStaticParams() {
  return Array.from({ length: PAGES - 1 }, (_, i) => ({ n: String(i + 2) }));
}

export async function generateMetadata(props: PageProps<"/idei/storinka/[n]">): Promise<Metadata> {
  const { n } = await props.params;
  return pageMeta({
    title: `Ідеї для персональних дитячих книжок — сторінка ${n}`,
    description: `Готові задуми для книжки з ім'ям дитини, сторінка ${n} з ${PAGES}.`,
    path: `/idei/storinka/${n}`,
  });
}

export default async function IdeasPageN(props: PageProps<"/idei/storinka/[n]">) {
  const { n } = await props.params;
  const page = Number(n);
  if (!Number.isInteger(page) || page < 2 || page > PAGES) notFound();
  return (
    <IdeasList
      title={`Ідеї для персональних дитячих книжок — сторінка ${page}`}
      lead="Відкрийте наші задуми для персональних дитячих книжок — оберіть готову ідею або надихніться на власну."
      ideas={IDEAS.slice((page - 1) * IDEAS_PER_PAGE, page * IDEAS_PER_PAGE)}
      page={page}
      pages={PAGES}
      crumbs={[
        { name: "Ідеї для книжок", path: "/idei" },
        { name: `Сторінка ${page}`, path: `/idei/storinka/${page}` },
      ]}
    />
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import IdeasList from "@/components/seo/IdeasList";
import { getTag, IDEA_TAGS, ideasByTag } from "@/lib/pages/ideas";
import { pageMeta } from "@/lib/seo";

export function generateStaticParams() {
  return IDEA_TAGS.map((t) => ({ tag: t.id }));
}

export async function generateMetadata(props: PageProps<"/idei/katehoriia/[tag]">): Promise<Metadata> {
  const { tag } = await props.params;
  const t = getTag(tag);
  if (!t) return {};
  const n = ideasByTag(tag).length;
  return pageMeta({
    title: `${t.label}: ідеї для персональних дитячих книжок`,
    description: `${n} ідей у категорії «${t.label}» для книжки, де головний герой — ваша дитина. Оберіть задум і створіть книжку за кілька хвилин.`,
    path: `/idei/katehoriia/${tag}`,
  });
}

export default async function IdeaTagPage(props: PageProps<"/idei/katehoriia/[tag]">) {
  const { tag } = await props.params;
  const t = getTag(tag);
  if (!t) notFound();
  return (
    <IdeasList
      title={`Ідеї для книжок: ${t.label.toLowerCase()}`}
      lead={`Задуми в категорії «${t.label}». Оберіть ідею — і ми напишемо історію, де головний герой саме ваша дитина.`}
      ideas={ideasByTag(tag)}
      activeTag={tag}
      crumbs={[
        { name: "Ідеї для книжок", path: "/idei" },
        { name: t.label, path: `/idei/katehoriia/${tag}` },
      ]}
    />
  );
}

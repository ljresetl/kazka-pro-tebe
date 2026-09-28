import type { Metadata } from "next";
import IdeasList from "@/components/seo/IdeasList";
import { IDEAS, IDEAS_PER_PAGE } from "@/lib/pages/ideas";
import { pageMeta } from "@/lib/seo";

export const metadata: Metadata = pageMeta({
  title: "Ідеї для персональних дитячих книжок",
  description: `${IDEAS.length} готових задумів для книжки, де головний герой — ваша дитина: пригоди, казки, свята, емоції, навчання й українські традиції.`,
  path: "/idei",
});

export default function IdeasPage() {
  return (
    <IdeasList
      title="Ідеї для персональних дитячих книжок"
      lead="Відкрийте наші задуми для персональних дитячих книжок — оберіть готову ідею або надихніться на власну."
      ideas={IDEAS.slice(0, IDEAS_PER_PAGE)}
      page={1}
      pages={Math.ceil(IDEAS.length / IDEAS_PER_PAGE)}
      crumbs={[{ name: "Ідеї для книжок", path: "/idei" }]}
    />
  );
}

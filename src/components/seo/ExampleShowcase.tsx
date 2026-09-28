import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ExampleCard from "@/components/ExampleCard";
import SlotImage from "@/components/SlotImage";
import { exampleParams, type ExampleStory } from "@/lib/examples";

/** Картка прикладу в 3 колонки (як на зразку): використані фото → обкладинка → параметри історії. */
export default function ExampleShowcase({ e }: { e: ExampleStory }) {
  return (
    <article className="ex-show">
      <div className="ex-show-photos">
        <h3 className="ex-show-h">Використані фото</h3>
        <SlotImage id={`pryklad-foto/${e.slug}`} alt={`Фото, з якого намальовано героя: ${e.childName}`} detail="none" sizes="200px" />
        <span className="ex-show-arrow" aria-hidden="true">
          ↘
        </span>
      </div>
      <ExampleCard e={e} />
      <div className="ex-show-body">
        <div className="ex-show-params">
          <h4 className="ex-show-h">Параметри історії</h4>
          <dl className="ex-param-list">
            {exampleParams(e).map(([k, v]) => (
              <div key={k} className="ex-param-row">
                <dt>{k}:</dt>
                <dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
        <Link href={`/pryklady/${e.slug}`} className="ex-show-link">
          Переглянути приклад <ArrowRight size={18} aria-hidden="true" />
        </Link>
        <Link href="/stvoryty" className="ex-show-link">
          Створити власну дитячу книжку <ArrowRight size={18} aria-hidden="true" />
        </Link>
      </div>
    </article>
  );
}

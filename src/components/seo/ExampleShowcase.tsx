import Link from "next/link";
import { ArrowRight } from "lucide-react";
import ExampleCard from "@/components/ExampleCard";
import SlotImage from "@/components/SlotImage";
import { exampleParams, type ExampleStory } from "@/lib/examples";

/** Картка прикладу: обкладинка, «Використані фото» й «Параметри історії» (як на зразку). */
export default function ExampleShowcase({ e }: { e: ExampleStory }) {
  return (
    <article className="ex-show">
      <ExampleCard e={e} />
      <div className="ex-show-body">
        <h3 className="ex-show-h">Використані фото</h3>
        <div className="ex-show-photo">
          <SlotImage id={`pryklad-foto/${e.slug}`} alt={`Фото, з якого намальовано героя: ${e.childName}`} detail="none" sizes="72px" />
          <span aria-hidden="true">→</span>
          <span className="muted">героя намальовано за фото</span>
        </div>
        <h4 className="ex-show-h">Параметри історії</h4>
        <dl className="ex-param-list">
          {exampleParams(e).map(([k, v]) => (
            <div key={k} className="ex-param-row">
              <dt>{k}:</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
        <div className="ex-show-links">
          <Link href={`/pryklady/${e.slug}`} className="feature-link">
            Переглянути приклад <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <Link href="/stvoryty" className="feature-link">
            Створити власну книжку <ArrowRight size={18} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

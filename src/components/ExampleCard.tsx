import Image from "next/image";
import Link from "next/link";
import type { ExampleStory } from "@/lib/examples";
import { getTheme } from "@/lib/themes";
import Scene from "./Scene";

export default function ExampleCard({ e }: { e: ExampleStory }) {
  return (
    <Link href={`/pryklady/${e.slug}`} className="card">
      {e.coverImage ? (
        <Image
          src={e.coverImage.src}
          width={e.coverImage.width}
          height={e.coverImage.height}
          alt={`Ілюстрація до казки «${e.title}»`}
          className="card-img"
          sizes="(max-width: 560px) 80vw, (max-width: 1000px) 45vw, 360px"
        />
      ) : (
        <Scene id={e.cover} />
      )}
      <div className="card-body">
        <h3>{e.title}</h3>
        <p>{e.summary}</p>
        <div className="tags">
          <span className="tag">{e.ageLabel}</span>
          <span className="tag is-mint">{getTheme(e.theme).label}</span>
          <span className="tag is-sun">{e.trait}</span>
        </div>
      </div>
    </Link>
  );
}

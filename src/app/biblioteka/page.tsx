import type { Metadata } from "next";
import Link from "next/link";
import Scene from "@/components/Scene";
import { LIBRARY } from "@/lib/library";

export const metadata: Metadata = {
  title: "Безкоштовна бібліотека казок",
  description: "Українські народні та авторські казки для дітей: читайте онлайн і друкуйте розмальовки безкоштовно.",
};

export default function LibraryPage() {
  return (
    <section className="section">
      <h1 className="riso-type" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
        Безкоштовна бібліотека
      </h1>
      <p className="section-lead">Читайте з екрана або друкуйте — ці казки безкоштовні для всіх.</p>
      <div className="library-grid">
        {LIBRARY.map((b) => (
          <Link key={b.slug} href={`/biblioteka/${b.slug}`} className="theme-card">
            <Scene id={b.cover} />
            <div className="theme-card-body">
              <h3>{b.title}</h3>
              <p>{b.summary}</p>
              <p className="muted" style={{ fontSize: 14 }}>
                {b.ages}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

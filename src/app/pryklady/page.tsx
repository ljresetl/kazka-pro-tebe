import type { Metadata } from "next";
import { Suspense } from "react";
import ExamplesList from "./ExamplesList";

export const metadata: Metadata = {
  title: "Приклади іменних казок",
  description: "10 прикладів іменних казок для дітей 3–7 років. Читайте онлайн і подивіться, якою буде казка про вашу дитину.",
};

export default function ExamplesPage() {
  return (
    <section className="section">
      <h1 className="riso-type" style={{ fontSize: "clamp(30px, 4vw, 44px)" }}>
        Приклади казок
      </h1>
      <p className="section-lead">
        Так виглядають іменні казки, які ми створюємо. Читайте прямо тут, а потім зробіть таку саму про свою дитину.
      </p>

      <Suspense>
        <ExamplesList />
      </Suspense>
    </section>
  );
}

"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useStory } from "@/lib/storage";
import CreateWizard from "./CreateWizard";

// Старі посилання ?theme=space ведуть на відповідну тему конструктора.
const LEGACY_THEME: Record<string, string> = {
  space: "kosmos",
  forest: "charivnyi-lis",
  sea: "pidvodnyi-svit",
  dino: "dynozavry",
  castle: "lytsari",
  meadow: "sadivnytstvo",
};

/** Продовження книжки: ті самі герої, стиль, шрифт і вік, нова тема. */
function Sequel({ id }: { id: string }) {
  const story = useStory(id);
  if (story === undefined) return <div className="writing" />;
  if (story === null) return <CreateWizard init={{ name: "", ageGroup: "", category: "", topic: "" }} />;
  const o = story.options ?? {};
  return (
    <CreateWizard
      init={{
        name: story.childName,
        gender: story.gender,
        age: story.age,
        ageGroup: o.ageGroup ?? "",
        category: "",
        topic: "",
        style: o.style,
        font: o.font,
        hobbies: o.hobbies,
        food: o.food,
        characters: o.characters,
        wish: `Це продовження книжки «${story.title}»: ті самі герої вирушають у нову пригоду й згадують попередню.`,
      }}
    />
  );
}

function CreateFromQuery() {
  const sp = useSearchParams();
  const sequel = sp.get("prodovzhennia");
  if (sequel) return <Sequel id={sequel} />;
  const legacy = LEGACY_THEME[sp.get("theme") ?? ""];
  return (
    <CreateWizard
      init={{
        name: sp.get("imia") ?? sp.get("name") ?? "",
        ageGroup: sp.get("vik") ?? "",
        category: sp.get("rozdil") ?? "",
        topic: sp.get("tema") ?? legacy ?? "",
      }}
    />
  );
}

export default function CreatePage() {
  return (
    <>
      <Suspense fallback={<div className="writing" />}>
        <CreateFromQuery />
      </Suspense>
      {/* У конструкторі, як на зразку, замість повного підвалу — три посилання. */}
      <nav className="wz-mini-footer" aria-label="Корисне">
        <Link href="/dopomoha">Центр допомоги</Link>
        <Link href="/umovy">Публічна оферта</Link>
        <Link href="/konfidentsiinist">Конфіденційність</Link>
      </nav>
    </>
  );
}

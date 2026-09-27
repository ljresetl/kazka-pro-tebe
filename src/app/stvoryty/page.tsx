"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
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

function CreateFromQuery() {
  const sp = useSearchParams();
  const legacy = LEGACY_THEME[sp.get("theme") ?? ""];
  return (
    <CreateWizard
      init={{
        name: sp.get("name") ?? "",
        ageGroup: sp.get("vik") ?? "",
        category: sp.get("rozdil") ?? "",
        topic: sp.get("tema") ?? legacy ?? "",
      }}
    />
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <CreateFromQuery />
    </Suspense>
  );
}

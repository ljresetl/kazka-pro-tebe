"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import CreateForm from "./CreateForm";

function CreateFromQuery() {
  const sp = useSearchParams();
  return <CreateForm initialName={sp.get("name") ?? ""} initialTheme={sp.get("theme") ?? "space"} />;
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <CreateFromQuery />
    </Suspense>
  );
}

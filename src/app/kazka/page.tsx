"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import StoryView from "./StoryView";

// Казки живуть у браузері покупця, тому номер казки береться з адреси: /kazka?id=…
function StoryById() {
  const id = useSearchParams().get("id") ?? "";
  return <StoryView id={id} />;
}

export default function StoryPage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <StoryById />
    </Suspense>
  );
}

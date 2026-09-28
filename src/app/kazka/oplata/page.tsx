"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";
import { addToCart, readStory } from "@/lib/storage";

// Старі посилання «Оплатити казку»: кладемо книжку в кошик і відкриваємо кошик.
function ToCart() {
  const sp = useSearchParams();
  const router = useRouter();
  useEffect(() => {
    const id = sp.get("id") ?? "";
    const story = readStory(id);
    if (story) {
      const hardcover = sp.get("product") === "print";
      addToCart({
        storyId: story.id,
        storyTitle: story.title,
        kind: hardcover ? "hardcover" : "ebook",
        cover: hardcover ? "matova" : undefined,
        ebookPaid: Boolean(story.paid),
        paidOrder: story.paidOrder,
      });
    }
    router.replace("/koshyk");
  }, [sp, router]);
  return <div className="writing" />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <ToCart />
    </Suspense>
  );
}

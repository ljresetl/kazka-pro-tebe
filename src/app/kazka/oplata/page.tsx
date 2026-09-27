"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Checkout from "./Checkout";

function CheckoutById() {
  const sp = useSearchParams();
  return <Checkout id={sp.get("id") ?? ""} initialProduct={sp.get("product") ?? undefined} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <CheckoutById />
    </Suspense>
  );
}

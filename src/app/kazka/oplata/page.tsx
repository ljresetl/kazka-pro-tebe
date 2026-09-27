"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import Checkout from "./Checkout";

function CheckoutById() {
  const id = useSearchParams().get("id") ?? "";
  return <Checkout id={id} />;
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="writing" />}>
      <CheckoutById />
    </Suspense>
  );
}

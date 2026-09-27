import { beforeAll, describe, expect, it } from "vitest";

describe("LiqPay", () => {
  beforeAll(() => {
    process.env.LIQPAY_PUBLIC_KEY = "sandbox_public";
    process.env.LIQPAY_PRIVATE_KEY = "sandbox_private";
  });

  it("створює посилання з даними й підписом, який проходить перевірку", async () => {
    const { checkoutUrl, decodeData, verifySignature } = await import("@/lib/liqpay");
    const url = new URL(
      checkoutUrl({
        orderId: "K-TEST1",
        amount: 199,
        description: "Казка",
        resultUrl: "https://example.com/r",
        serverUrl: "https://example.com/s",
      }),
    );
    expect(url.origin + url.pathname).toBe("https://www.liqpay.ua/api/3/checkout");
    const data = url.searchParams.get("data")!;
    const signature = url.searchParams.get("signature")!;
    expect(verifySignature(data, signature)).toBe(true);
    const payload = decodeData<{ amount: number; currency: string; order_id: string; action: string; version: number }>(
      data,
    );
    expect(payload).toMatchObject({ amount: 199, currency: "UAH", order_id: "K-TEST1", action: "pay", version: 3 });
  });

  it("відхиляє підроблений підпис", async () => {
    const { verifySignature } = await import("@/lib/liqpay");
    const data = Buffer.from(JSON.stringify({ order_id: "K-X", status: "success" })).toString("base64");
    expect(verifySignature(data, "fake-signature")).toBe(false);
  });
});

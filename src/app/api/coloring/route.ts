import { z } from "zod";
import { drawColoring, imagesConfigured } from "@/lib/ai-images";
import { takeColoring, validTicket } from "@/lib/quota";

export const maxDuration = 120;

// Розмальовка сторінки для оплаченої книжки: браузер надсилає готову ілюстрацію,
// сервер повертає чисті чорні контури (src/lib/ai-images.ts → drawColoring).
const Schema = z.object({
  storyId: z.string().max(40),
  ticket: z.string().max(64),
  paidTicket: z.string().max(64),
  image: z.object({ mimeType: z.enum(["image/png", "image/jpeg", "image/webp"]), data: z.string().max(3_000_000) }),
});

export async function POST(request: Request) {
  if (!imagesConfigured()) return Response.json({ error: "Розмальовки ще не налаштовані." }, { status: 503 });
  const parsed = Schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Неправильний запит." }, { status: 400 });
  const { storyId, ticket, paidTicket, image } = parsed.data;
  if (!validTicket(storyId, ticket)) return Response.json({ error: "Казку не знайдено." }, { status: 403 });
  const quota = await takeColoring(storyId, paidTicket);
  if (!quota.ok) {
    return Response.json(
      { error: quota.reason === "unpaid" ? "Розмальовка доступна після оплати книжки." : "Ліміт розмальовок для цієї книжки вичерпано." },
      { status: 402 },
    );
  }
  try {
    return Response.json(await drawColoring(image));
  } catch (err) {
    console.error("Coloring failed:", err);
    return Response.json({ error: "Не вдалося зробити розмальовку. Спробуйте ще раз." }, { status: 502 });
  }
}

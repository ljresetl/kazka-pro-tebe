// Форма «Контакти»: пересилає повідомлення (і до 3 фото) у Telegram продавцю.
// Змінні середовища: TELEGRAM_BOT_TOKEN (від @BotFather) і TELEGRAM_CHAT_ID (куди надсилати).

const MAX_PHOTOS = 3;
const MAX_PHOTO_BYTES = 5 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function clean(v: FormDataEntryValue | null, max: number) {
  return String(v ?? "")
    .trim()
    .slice(0, max);
}

export async function POST(request: Request) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chat = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chat) return Response.json({ error: "not-configured" }, { status: 503 });

  const form = await request.formData().catch(() => null);
  if (!form) return Response.json({ error: "Перевірте форму." }, { status: 400 });
  const name = clean(form.get("name"), 80);
  const email = clean(form.get("email"), 120);
  const subject = clean(form.get("subject"), 120);
  const message = clean(form.get("message"), 3000);
  if (!name || !EMAIL_RE.test(email) || !subject || !message) {
    return Response.json({ error: "Заповніть усі поля." }, { status: 400 });
  }

  const text = `✉️ Повідомлення з сайту\nІм'я: ${name}\nПошта: ${email}\nТема: ${subject}\n\n${message}`;
  const api = `https://api.telegram.org/bot${token}`;
  const res = await fetch(`${api}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chat, text }),
  });
  if (!res.ok) return Response.json({ error: "Не вдалося надіслати. Спробуйте пізніше." }, { status: 502 });

  const photos = form
    .getAll("photos")
    .filter((f): f is File => f instanceof File && f.size > 0)
    .slice(0, MAX_PHOTOS);
  for (const photo of photos) {
    if (photo.size > MAX_PHOTO_BYTES || !photo.type.startsWith("image/")) continue;
    const body = new FormData();
    body.append("chat_id", chat);
    body.append("caption", `Фото від ${name} (${email})`);
    body.append("photo", photo, photo.name);
    await fetch(`${api}/sendPhoto`, { method: "POST", body }).catch(() => {});
  }
  return Response.json({ ok: true });
}

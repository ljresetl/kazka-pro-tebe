# Казкарня

Іменні казки українською: батьки вводять ім'я дитини, обирають пригоду — і одразу читають ілюстровану казку. Плюс безкоштовна бібліотека народних казок і блог-розбори.

Живий сайт: https://ljresetl.github.io/kazka-pro-tebe/

## Запуск локально

```bash
npm install
npm run dev
```

## Що де лежить

| Файл | Що змінювати |
| --- | --- |
| `src/lib/site.ts` | **Назва бренду, реквізити ФОП, пошта, телефон, соцмережі.** Заповнити до підключення оплати |
| `src/lib/payment.ts` | **Єдине місце для підключення оплати** (LiqPay / WayForPay / monobank). Інструкція в коментарі |
| `src/lib/prices.ts` | Ціни й описи товарів |
| `src/lib/template-story.ts` | 10 шаблонних сюжетів казок |
| `src/lib/examples.ts` | 10 прикладів (сюжет + ім'я дитини) |
| `src/lib/library.ts` | Безкоштовна бібліотека. Нова казка = новий запис |
| `src/lib/blog.ts` | Статті блогу. Нова стаття = новий запис |
| `src/lib/ai-story.ts` | Генерація казок через Claude (потрібен сервер і ключ) |
| `docs/dzherela-kazok.md` | Джерела казок і правила авторського права |
| `docs/ilyustratsii.md` | Промпти для генерації ілюстрацій |

## Сторінки

`/` головна · `/stvoryty` створення · `/kazka?id=` казка · `/kazka/oplata?id=` оформлення · `/moi-kazky` мої казки · `/pryklady` приклади · `/biblioteka` бібліотека · `/blog` блог · `/dostavka-i-oplata`, `/umovy`, `/konfidentsiinist`, `/kontakty` — службові.

## Як увімкнути ШІ й оплату (переїзд на Vercel)

1. Зайти на [vercel.com](https://vercel.com) через GitHub і імпортувати репозиторій `kazka-pro-tebe`.
2. У **Settings → Environment Variables** вписати змінні з `.env.example`:
   - `NEXT_PUBLIC_AI_ENABLED=1` і `ANTHROPIC_API_KEY` — казки пише Claude, з'являється поле «Про що має бути казка»;
   - `LIQPAY_PUBLIC_KEY`, `LIQPAY_PRIVATE_KEY`, спершу `LIQPAY_SANDBOX=1` і `NEXT_PUBLIC_PAYMENT_MODE=live` — перевірити тестову оплату;
   - коли все працює — прибрати `LIQPAY_SANDBOX`.
3. Підключити власний домен у **Settings → Domains** і вказати його в `NEXT_PUBLIC_SITE_URL`.
4. У кабінеті LiqPay нічого додатково налаштовувати не треба: адреси повернення й сповіщень сайт передає сам.

Сайт на Vercel збирається як звичайний Next.js із сервером; GitHub Pages можна після цього вимкнути.

## Публікація

Кожен push у `main` автоматично збирає статичну версію й викладає її на GitHub Pages (`.github/workflows/pages.yml`). На Pages немає сервера, тож казки складаються в браузері за шаблонами.

Для справжньої оплати й генерації через Claude сайт треба перенести на хостинг із сервером (наприклад, Vercel): код уже підтримує обидва режими.

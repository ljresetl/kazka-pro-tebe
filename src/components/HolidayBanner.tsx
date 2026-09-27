"use client";

import Link from "next/link";
import { useSyncExternalStore } from "react";
import { daysWord, nextHoliday } from "@/lib/holidays";
import SlotImage from "./SlotImage";

const noop = () => () => {};
// Дата як рядок: стабільний знімок для useSyncExternalStore; на сервері — порожньо.
const today = () => new Date().toDateString();

/** Банер найближчого свята з відліком днів (рахується в браузері, щоб дата була актуальна). */
export default function HolidayBanner() {
  const day = useSyncExternalStore(noop, today, () => "");
  const next = day ? nextHoliday(new Date(day)) : null;
  return (
    <div className="holiday-band">
      <div>
        {next ? (
          <>
            <span className="holiday-days">
              Ще {next.days} {daysWord(next.days)}
            </span>
            <h2>{next.holiday.label} вже скоро</h2>
            <p>Подаруйте {next.holiday.gift}, де головний герой — ваша дитина. PDF буде готовий одразу.</p>
            <Link href={`/stvoryty?tema=${next.holiday.topic}`} className="btn btn-primary">
              Створити святкову казку
            </Link>
          </>
        ) : (
          <>
            <h2>Казка до свята</h2>
            <p>День народження, Миколай, Різдво — подаруйте казку, де головний герой — ваша дитина.</p>
            <Link href="/stvoryty?rozdil=sviata" className="btn btn-primary">
              Створити святкову казку
            </Link>
          </>
        )}
      </div>
      <SlotImage id="home/podarunok" alt="Книжка-подарунок зі стрічкою" detail="full" sizes="(min-width: 900px) 400px, 90vw" />
    </div>
  );
}

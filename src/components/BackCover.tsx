import { SITE } from "@/lib/site";
import { Kvitka } from "./Ornament";

const base = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

/** Книжки-приклади з сайту (обкладинки в public/img/pryklad-obkladynka) — легкий список для читанки. */
const SHELF = [
  ["mariyka-i-zoryanyi-kyt", "Марійка і зоряний кит"],
  ["tymko-i-taiemnytsia-lisu", "Тимко і таємниця лісу"],
  ["solomiia-i-mushlia", "Соломія і мушля, що співає"],
  ["danylko-i-dyplodok", "Данилко і маленький диплодок"],
  ["zlata-i-drakon", "Злата і дракон-боягуз"],
  ["ostap-i-kvitkove-sviato", "Остап рятує квіткове свято"],
  ["veronika-i-sumnyi-misyats", "Вероніка і сумний Місяць"],
  ["maksym-i-mayak", "Максим і маяк, що згас"],
  ["sofiyka-i-yaitse", "Софійка і яйце з сюрпризом"],
  ["andriiko-i-solovei", "Андрійко і загублена пісня"],
] as const;

/**
 * Задня обкладинка, як у видавництв: розмитий малюнок обкладинки як фон, угорі — до 10 інших книжок
 * «Казкарні» з назвами, по центру — квітка-знак, унизу — де замовити. Без нових малюнків від ШІ.
 */
export default function BackCover({ background }: { background?: string }) {
  const host = SITE.url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return (
    <div className="back-cover">
      {/* eslint-disable-next-line @next/next/no-img-element -- фон для друку */}
      {background && <img className="back-bg" src={background} alt="" />}
      <div className="back-shelf">
        {SHELF.map(([slug, title]) => (
          <figure key={slug} className="back-book">
            {/* eslint-disable-next-line @next/next/no-img-element -- мініатюра для друку */}
            <img src={`${base}/img/pryklad-obkladynka/${slug}.webp`} alt="" />
            <figcaption>{title}</figcaption>
          </figure>
        ))}
      </div>
      <Kvitka size={56} className="back-mark" />
      <div className="back-order">
        <p>Замовляйте свою іменну казку на сайті «Казкарні»</p>
        <p className="back-url">{host}</p>
      </div>
    </div>
  );
}

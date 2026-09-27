// Шрифти, якими може бути набрана книжка (крок «Шрифт» у конструкторі).
// preload: false — файли шрифтів вантажаться лише там, де ними справді пишуть.
import { Alegreya, Caveat, Comfortaa, Neucha, Pacifico, Roboto_Slab, Rubik_Bubbles, Russo_One } from "next/font/google";

const alegreya = Alegreya({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: ["500", "700"] });
const comfortaa = Comfortaa({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: ["500", "700"] });
const rubikBubbles = Rubik_Bubbles({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: "400" });
const pacifico = Pacifico({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: "400" });
const russoOne = Russo_One({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: "400" });
const caveat = Caveat({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: ["500", "700"] });
const neucha = Neucha({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: "400" });
const robotoSlab = Roboto_Slab({ subsets: ["latin", "cyrillic"], display: "swap", preload: false, weight: ["400", "700"] });

/** id шрифту з каталогу → CSS-клас next/font. */
export const BOOK_FONT_CLASS: Record<string, string> = {
  kazkova: alegreya.className,
  pisok: comfortaa.className,
  bulbashky: rubikBubbles.className,
  tsukerka: pacifico.className,
  neon: russoOne.className,
  zavytky: caveat.className,
  shkilnyi: neucha.className,
  pryhodnytskyi: robotoSlab.className,
};

export function bookFontClass(id?: string) {
  return (id && BOOK_FONT_CLASS[id]) || "";
}

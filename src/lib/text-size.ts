/** Клас розміру шрифту за довжиною тексту сторінки — малюнок лишається однакової висоти. */
export function textSize(text: string) {
  return text.length > 420 ? "len-l" : text.length > 330 ? "len-m" : "";
}

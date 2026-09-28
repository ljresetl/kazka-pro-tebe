import type { Metadata } from "next";
import InfoPage from "@/components/InfoPage";
import { pageMeta } from "@/lib/seo";
import { SITE } from "@/lib/site";

export const metadata: Metadata = pageMeta({
  title: "Авторські права й ліцензії",
  description: `Звідки на сайті ${SITE.name} ілюстрації, іконки й шрифти та за якими ліцензіями вони використовуються.`,
  path: "/litsenzii",
});

export default function LicensesPage() {
  return (
    <InfoPage title="Авторські права й ліцензії" updated="29 вересня 2026 року">
      <p>
        Тексти, історії й дизайн сайту {SITE.name} створені нами. Для частини зображень ми використовуємо відкриті
        бібліотеки, ліцензії яких дозволяють комерційне використання. Нижче — перелік джерел.
      </p>

      <h2>3D-іконки й персонажі</h2>
      <p>
        <strong>Microsoft Fluent Emoji</strong> — © Microsoft Corporation, ліцензія MIT.{" "}
        <a href="https://github.com/microsoft/fluentui-emoji" rel="noopener">
          github.com/microsoft/fluentui-emoji
        </a>
        . З цих іконок ми склали ілюстрації тем, обкладинки книжок з іменами, картки віку, подарунків і статей блогу.
      </p>
      <details>
        <summary>Текст ліцензії MIT</summary>
        <p>
          Copyright (c) Microsoft Corporation. Permission is hereby granted, free of charge, to any person obtaining a
          copy of this software and associated documentation files (the &quot;Software&quot;), to deal in the Software
          without restriction, including without limitation the rights to use, copy, modify, merge, publish,
          distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is
          furnished to do so, subject to the following conditions: The above copyright notice and this permission
          notice shall be included in all copies or substantial portions of the Software. THE SOFTWARE IS PROVIDED
          &quot;AS IS&quot;, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE
          WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
          AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF
          CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER
          DEALINGS IN THE SOFTWARE.
        </p>
      </details>

      <h2>Шрифти</h2>
      <p>
        <strong>Nunito</strong> та інші шрифти книжок (Alegreya, Comfortaa, Rubik Bubbles, Pacifico, Russo One, Caveat,
        Neucha, Roboto Slab) — з колекції Google Fonts, ліцензія SIL Open Font License 1.1.{" "}
        <a href="https://openfontlicense.org" rel="noopener">
          openfontlicense.org
        </a>
      </p>

      <h2>Ілюстрації в книжках покупців</h2>
      <p>
        Ілюстрації до персональних книжок створює штучний інтелект спеціально для кожної книжки. Покупець може
        використовувати свою книжку для особистих і сімейних потреб (див. <a href="/umovy">публічну оферту</a>).
      </p>
    </InfoPage>
  );
}

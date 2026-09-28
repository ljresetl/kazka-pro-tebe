import type { Metadata } from "next";
import CopyButton from "@/components/CopyButton";
import SlotImage from "@/components/SlotImage";
import { blogImage, POSTS } from "@/lib/blog";
import { ALL_IMAGES as BASE_IMAGES, IMAGE_GROUPS as BASE_GROUPS, isReady } from "@/lib/images";

const ALL_IMAGES = [...BASE_IMAGES, ...POSTS.map(blogImage)];
const IMAGE_GROUPS = [...BASE_GROUPS, { id: "blog", label: `Статті блогу (${POSTS.length})` }];
import libraryImages from "@/lib/library-images.json";
import { pageMeta } from "@/lib/seo";

// Файли, зібрані з бібліотек (тимчасові) — їх варто замінити ілюстраціями від ШІ.
const LIBRARY = new Set<string>(libraryImages as string[]);

export const metadata: Metadata = pageMeta({
  title: "Картинки для генерації",
  description: "Службова сторінка: список картинок сайту з описами для генерації.",
  path: "/zaglushky",
  noindex: true,
});

export default function PlaceholdersPage() {
  const ready = ALL_IMAGES.filter(isReady).length;
  const fromLibrary = ALL_IMAGES.filter((s) => LIBRARY.has(s.file)).length;
  return (
    <div className="wrap page-pad">
      <div className="page-top">
        <h1>Картинки для генерації</h1>
        <p>
          Готово {ready} з {ALL_IMAGES.length}, з них {fromLibrary} — тимчасові з бібліотек (3D-іконки Fluent Emoji),
          їх варто замінити ілюстраціями від ШІ. Скопіюйте опис, вставте в ChatGPT (як на сайті-зразку, для іконок — з прозорим фоном), Gemini чи інший генератор, збережіть
          результат як WebP під указаним ім&apos;ям у папку <code>public</code> — і картинка замінить заглушку на
          сайті.
        </p>
      </div>
      {IMAGE_GROUPS.map((g) => {
        const items = ALL_IMAGES.filter((s) => s.group === g.id);
        return (
          <section key={g.id} className="ph-group">
            <h2>{g.label}</h2>
            <ul className="ph-list">
              {items.map((s) => (
                <li key={s.id} className={isReady(s) ? "is-ready" : ""}>
                  <SlotImage id={s.id} slot={s} alt={s.title} detail="none" className="ph-thumb" />
                  <div>
                    <strong>{s.title}</strong>
                    <p className="ph-meta">
                      {LIBRARY.has(s.file) ? "тимчасова з бібліотеки" : isReady(s) ? "✓ готово" : "потрібна"} · <code>public{s.file}</code> · {s.width}×{s.height}
                    </p>
                    <p className="ph-prompt">{s.prompt}</p>
                    <CopyButton text={s.prompt} />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        );
      })}
    </div>
  );
}

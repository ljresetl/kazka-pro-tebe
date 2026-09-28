import Link from "next/link";
import { POSTS } from "@/lib/blog";
import { Section, SectionHead } from "./Blocks";

/** Кілька статей блогу внизу сторінки. */
export default function BlogTeasers({ limit = 4, tint }: { limit?: number; tint?: boolean }) {
  const posts = POSTS.slice(0, limit);
  if (posts.length === 0) return null;
  return (
    <Section tint={tint}>
      <SectionHead title="Блог про дитячі книжки" />
      <ul className="blog-teasers">
        {posts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`}>
              <strong>{p.title}</strong>
              <span>Читати далі →</span>
            </Link>
          </li>
        ))}
      </ul>
    </Section>
  );
}

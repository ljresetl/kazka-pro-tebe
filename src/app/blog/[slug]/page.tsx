import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackLink from "@/components/BackLink";
import { Kvitka, OrnamentRule } from "@/components/Ornament";
import ShareButtons from "@/components/ShareButtons";
import { blogImage, formatDate, getPost, POSTS } from "@/lib/blog";
import SlotImage from "@/components/SlotImage";
import { getBook } from "@/lib/library";
import { jsonLd, OG_IMAGE, pageMeta } from "@/lib/seo";
import { abs, SITE } from "@/lib/site";

export function generateStaticParams() {
  return POSTS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata(props: PageProps<"/blog/[slug]">): Promise<Metadata> {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) return {};
  const meta = pageMeta({ title: post.title, description: post.description, path: `/blog/${post.slug}`, type: "article" });
  return {
    ...meta,
    openGraph: { ...meta.openGraph, type: "article", publishedTime: post.date },
  };
}

export default async function BlogPostPage(props: PageProps<"/blog/[slug]">) {
  const { slug } = await props.params;
  const post = getPost(slug);
  if (!post) notFound();
  const url = abs(`/blog/${post.slug}`);
  const book = post.librarySlug ? getBook(post.librarySlug) : undefined;
  const others = POSTS.filter((p) => p.slug !== post.slug).slice(0, 3);

  const articleLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: "uk",
    image: OG_IMAGE.url,
    mainEntityOfPage: url,
    author: { "@type": "Organization", name: SITE.name, url: abs("/") },
    publisher: { "@type": "Organization", name: SITE.name, logo: { "@type": "ImageObject", url: `${SITE.url}/icon.svg` } },
  };
  const crumbsLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Головна", item: abs("/") },
      { "@type": "ListItem", position: 2, name: "Блог", item: abs("/blog") },
      { "@type": "ListItem", position: 3, name: post.title, item: url },
    ],
  };

  return (
    <article className="wrap article">
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(articleLd)} />
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLd(crumbsLd)} />
      <div className="back-row">
        <BackLink fallback="/blog" label="Усі статті" />
      </div>
      <nav aria-label="Хлібні крихти" style={{ marginTop: 16 }}>
        <ol className="crumbs">
          <li>
            <Link href="/">Головна</Link>
          </li>
          <li>
            <Link href="/blog">Блог</Link>
          </li>
          <li aria-current="page">{post.title}</li>
        </ol>
      </nav>

      <header className="article-head">
        <h1>{post.title}</h1>
        <p className="post-meta">
          <time dateTime={post.date}>{formatDate(post.date)}</time> · {post.readMinutes} хв читання
        </p>
        <SlotImage id={`blog/${post.slug}`} slot={blogImage(post)} alt="" detail="label" className="article-img" priority sizes="(min-width: 900px) 760px, 92vw" />
        <p className="article-lead">{post.lead}</p>
      </header>

      {book && (
        <nav className="article-toc" aria-label="Зміст статті">
          <a href="#tekst">Повний текст казки</a>
          <a href="#rozbir">Розбір</a>
          <a href="#pytannia">Запитання для дитини</a>
        </nav>
      )}

      {book && (
        <section id="tekst" className="tale-text">
          <h2>«{book.title}» — повний текст</h2>
          <p className="muted" style={{ fontSize: 15 }}>
            {book.author}. Читати {book.pages.length} коротких частин — близько {Math.max(3, Math.round(book.pages.length * 0.6))}{" "}
            хвилин.
          </p>
          {book.pages.map((p, i) => (
            <p key={i}>{p.text}</p>
          ))}
        </section>
      )}

      <div id="rozbir" />
      {post.sections.map((s) => (
        <section key={s.heading}>
          <h2>{s.heading}</h2>
          {s.paragraphs.map((p, i) => (
            <p key={i}>{p}</p>
          ))}
        </section>
      ))}

      <aside className="article-box" id="pytannia">
        <Kvitka size={36} />
        <h2>Запитання для розмови з дитиною</h2>
        <ol>
          {post.questions.map((q) => (
            <li key={q}>{q}</li>
          ))}
        </ol>
      </aside>

      {book && (
        <div className="panel" style={{ marginTop: 28 }}>
          <h2>Казка «{book.title}» з ілюстраціями</h2>
          <p>Читайте посторінково з малюнками або роздрукуйте разом із розмальовкою — безкоштовно.</p>
          <div className="button-row">
            <Link href={`/biblioteka/${book.slug}`} className="btn btn-primary">
              Читати казку
            </Link>
            <Link href="/stvoryty" className="btn btn-ghost">
              Створити казку про свою дитину
            </Link>
          </div>
        </div>
      )}

      <div style={{ marginTop: 28 }}>
        <ShareButtons url={url} title={post.title} text={`${post.title} —`} label="Поділитися статтею" />
      </div>

      {others.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <OrnamentRule className="ornament-rule" />
          <h2>Читайте також</h2>
          <div className="post-list">
            {others.map((p) => (
              <Link key={p.slug} href={`/blog/${p.slug}`} className="post-card">
                <h3>{p.title}</h3>
                <p>{p.description}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </article>
  );
}

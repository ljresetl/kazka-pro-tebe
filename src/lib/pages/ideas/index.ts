// Ідеї для книжок (/idei): ~160 готових задумів із категоріями.
import { IDEAS_1 } from "./part1";
import { IDEAS_2 } from "./part2";
import { IDEAS_3 } from "./part3";
import { IDEAS_4 } from "./part4";
import { IDEA_TAGS, type Idea } from "./types";

export { IDEA_TAGS, type Idea };

export const IDEAS: Idea[] = [...IDEAS_1, ...IDEAS_2, ...IDEAS_3, ...IDEAS_4];

const BY_SLUG = new Map(IDEAS.map((i) => [i.slug, i]));

export function getIdea(slug: string) {
  return BY_SLUG.get(slug);
}

export function getTag(id: string) {
  return IDEA_TAGS.find((t) => t.id === id);
}

export function ideasByTag(tag: string) {
  return IDEAS.filter((i) => i.tags.includes(tag));
}

/** Скільки ідей на одній сторінці списку (як на зразку). */
export const IDEAS_PER_PAGE = 28;

export function ideasForTopic(topic: string, limit: number) {
  const own = IDEAS.filter((i) => i.topic === topic);
  return own.slice(0, limit);
}

/** Інші ідеї: спершу з тими самими категоріями. */
export function relatedIdeas(idea: Idea, limit = 4) {
  const scored = IDEAS.filter((i) => i.slug !== idea.slug)
    .map((i) => ({ i, s: i.tags.filter((t) => idea.tags.includes(t)).length + (i.topic === idea.topic ? 2 : 0) }))
    .sort((a, b) => b.s - a.s);
  return scored.slice(0, limit).map((x) => x.i);
}

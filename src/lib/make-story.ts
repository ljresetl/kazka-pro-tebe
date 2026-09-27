import { PLOTS, plotCount, templateStory } from "./template-story";
import type { Story, StoryRequest } from "./types";

/**
 * Шаблонна казка — працює і на сервері, і прямо в браузері.
 * `avoidPlotId` — сюжет, який не треба повторювати (кнопка «Інший сюжет»).
 */
export function makeTemplateStory(req: StoryRequest, avoidPlotId?: string): Story {
  const count = plotCount(req.theme);
  let variant = Math.floor(Math.random() * count);
  if (avoidPlotId && count > 1) {
    const current = PLOTS[req.theme].findIndex((p) => p.id === avoidPlotId);
    if (current >= 0) variant = (current + 1) % count;
  }
  // Випадковий seed — щоразу інші формулювання, імена помічників і деталі.
  const content = templateStory(req, variant, Math.floor(Math.random() * 2 ** 31));
  return {
    id: crypto.randomUUID().slice(0, 8),
    childName: req.childName,
    gender: req.gender,
    age: req.age,
    theme: req.theme,
    trait: req.trait,
    friend: req.friend,
    message: req.message,
    wish: req.wish,
    createdAt: Date.now(),
    source: "template",
    ...content,
  };
}

/** Відновлює параметри запиту з уже створеної казки. */
export function requestFromStory(story: Story): StoryRequest {
  return {
    childName: story.childName,
    gender: story.gender,
    age: story.age,
    theme: story.theme,
    trait: story.trait ?? "сміливість",
    friend: story.friend,
    message: story.message,
    wish: story.wish,
  };
}

import { plotCount, templateStory } from "./template-story";
import type { Story, StoryRequest } from "./types";

/** Шаблонна казка з випадковим сюжетом — працює і на сервері, і прямо в браузері. */
export function makeTemplateStory(req: StoryRequest): Story {
  const content = templateStory(req, Math.floor(Math.random() * plotCount(req.theme)));
  return {
    id: crypto.randomUUID().slice(0, 8),
    childName: req.childName,
    gender: req.gender,
    age: req.age,
    theme: req.theme,
    createdAt: Date.now(),
    source: "template",
    ...content,
  };
}

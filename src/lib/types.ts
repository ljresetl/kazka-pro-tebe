export const SCENES = [
  "home",
  "forest",
  "sea",
  "space",
  "dino",
  "castle",
  "night",
  "meadow",
] as const;

// Сюжетні ілюстрації — намальовані під конкретні події казок.
// ШІ їх не обирає (у запиті до моделі лише загальні сцени SCENES).
export const STORY_SCENES = [
  "sing-home",
  "crab-door",
  "boat-dolphins",
  "island-silent",
  "island-singing",
  "shell-gift",
] as const;

export type SceneId = (typeof SCENES)[number] | (typeof STORY_SCENES)[number];

export type Gender = "boy" | "girl";

export type ThemeId = "space" | "forest" | "sea" | "dino" | "castle" | "meadow";

/** Готова ілюстрація-картинка (лежить у public/illustrations). */
export type Illustration = {
  src: string;
  width: number;
  height: number;
};

export type StoryPage = {
  text: string;
  scene: SceneId;
  /** Якщо є — показується замість намальованої сцени. */
  image?: Illustration;
};

export type Story = {
  id: string;
  title: string;
  dedication: string;
  childName: string;
  gender: Gender;
  age: number;
  theme: ThemeId;
  pages: StoryPage[];
  source: "ai" | "template" | "library";
  createdAt: number;
  paid?: boolean;
};

export type StoryRequest = {
  childName: string;
  gender: Gender;
  age: number;
  theme: ThemeId;
  trait: string;
  friend?: string;
};

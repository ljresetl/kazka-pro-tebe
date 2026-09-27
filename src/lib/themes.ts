import type { SceneId, ThemeId } from "./types";

export type Theme = {
  id: ThemeId;
  label: string;
  blurb: string;
  scene: SceneId;
  titleFor: (name: string) => string;
};

export const THEMES: Theme[] = [
  {
    id: "space",
    label: "Космос",
    blurb: "Політ до зірок і пошук загубленого місяця",
    scene: "space",
    titleFor: (n) => `${n} і зоряний кит`,
  },
  {
    id: "forest",
    label: "Чарівний ліс",
    blurb: "Стежка між дубами, мудра сова і таємниця старого пенька",
    scene: "forest",
    titleFor: (n) => `${n} і таємниця лісу`,
  },
  {
    id: "sea",
    label: "Море",
    blurb: "Подорож на човнику до острова, де живуть мушлі-співачки",
    scene: "sea",
    titleFor: (n) => `${n} і мушля, що співає`,
  },
  {
    id: "dino",
    label: "Динозаври",
    blurb: "Добрий диплодок, який загубив маму",
    scene: "dino",
    titleFor: (n) => `${n} і маленький диплодок`,
  },
  {
    id: "castle",
    label: "Замок і дракон",
    blurb: "Дракон, який боїться темряви, і сміливий гість",
    scene: "castle",
    titleFor: (n) => `${n} і дракон-боягуз`,
  },
  {
    id: "meadow",
    label: "Лука і бджілки",
    blurb: "Квіткове свято, яке ледь не скасували",
    scene: "meadow",
    titleFor: (n) => `${n} рятує квіткове свято`,
  },
];

export const TRAITS = [
  "сміливість",
  "доброта",
  "допитливість",
  "терплячість",
  "вміння дружити",
  "кмітливість",
];

export function getTheme(id: string): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}

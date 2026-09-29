// page-flip не постачає типів у dist — описуємо лише те, чим користується читалка.
declare module "page-flip" {
  export type FlipSettings = {
    width: number;
    height: number;
    size?: "fixed" | "stretch";
    minWidth?: number;
    maxWidth?: number;
    minHeight?: number;
    maxHeight?: number;
    showCover?: boolean;
    usePortrait?: boolean;
    mobileScrollSupport?: boolean;
    maxShadowOpacity?: number;
    flippingTime?: number;
    drawShadow?: boolean;
    startPage?: number;
  };
  export class PageFlip {
    constructor(element: HTMLElement, settings: FlipSettings);
    loadFromHTML(items: HTMLElement[]): void;
    on(event: "flip" | "changeOrientation" | "changeState" | "init" | "update", cb: (e: { data: unknown }) => void): this;
    flipNext(): void;
    flipPrev(): void;
    getOrientation(): "portrait" | "landscape";
    getCurrentPageIndex(): number;
    destroy(): void;
  }
}

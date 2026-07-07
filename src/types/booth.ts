export type BoothStep = 'preview' | 'capture' | 'select' | 'editor' | 'result';

export type CapturedPhoto = {
  id: string;
  src: string; // Base64 data URL or mock image path
  capturedAt: number;
  crop: {
    x: number;
    y: number;
    width: number;
    height: number;
    aspectRatio: '3:4';
  };
};

export type PhotoPlacement = {
  photoId: string;
  slotId: string;
  sourceCrop: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  transform: {
    zoom: number;
    offsetX: number;
    offsetY: number;
  };
};

export type PhotoTransform = {
  zoom: number;
  offsetX: number; // range: -1.0 to 1.0
  offsetY: number; // range: -1.0 to 1.0
};

export type EffectId = 'thermal' | 'mirror' | 'pixelate' | 'vhs';

export type FontChoice = 'Inter' | 'Playfair Display' | 'JetBrains Mono' | 'Great Vibes';

export type CaptionCustomization = {
  text: string;
  fontFamily: FontChoice;
};

export type FrameOverrides = {
  backgroundColor?: string;
  cornerShape: 'square' | 'rounded' | 'pill';
  innerGapPx: number;
  borderPx: number;
};

export type StickerSize = 's' | 'm' | 'l';

export type PlacedSticker = {
  id: string;
  assetId: string;
  cx: number;
  cy: number;
  size: StickerSize;
};

export type CustomizationState = {
  layout: import('./frames').FrameLayout;
  frameId: string;
  filterId: string;
  effectId: EffectId | null;
  photoTransforms: Record<string, PhotoTransform>;
  caption: CaptionCustomization;
  frameOverrides: FrameOverrides;
  placedStickers: PlacedSticker[];
};

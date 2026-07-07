export type FrameLayout = 'strip-4' | 'grid-2x2';

export type PhotoSlot = {
  id: string;
  x: number; // Coordinate in pixels relative to output dimensions
  y: number;
  width: number;
  height: number;
  radius?: number;
};

export type LayoutTemplate = {
  id: FrameLayout;
  name: string;
  outputWidth: number;
  outputHeight: number;
  photoSlots: PhotoSlot[];
};

export type FrameVisualPreset = {
  id: string;
  name: string;
  backgroundColor: string;
  borderColor?: string;
  textColor?: string;
  overlayImageSrc?: string; // placeholder overlay metadata
  themeId?: 'classic-film' | 'vintage-paper' | 'studio-neon' | 'standard';
};

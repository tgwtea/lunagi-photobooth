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

export type FooterCustomization = {
  text: string;
  fontFamily: string;
  color: string; // custom hex or empty string for default
  alignment: 'left' | 'center' | 'right';
  showDate: boolean;
};

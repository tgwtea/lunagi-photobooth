export type FilterPreset = {
  id: string;
  name: string;
  className: string;
  cssFilter: string;
  grain?: number;
  vignette?: number;
  bloom?: number;
  monoFallback?: boolean;
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'original', name: 'Original', className: '', cssFilter: 'none' },
  { id: 'golden', name: 'Golden', className: 'photo-golden', cssFilter: 'sepia(18%) saturate(118%) brightness(104%) contrast(101%)', bloom: 0.08 },
  { id: 'arctic', name: 'Arctic', className: 'photo-arctic', cssFilter: 'saturate(92%) brightness(105%) contrast(104%) hue-rotate(188deg)', vignette: 0.08 },
  { id: 'bw-film', name: 'B&W Film', className: 'photo-bw-film', cssFilter: 'grayscale(100%) contrast(116%) brightness(96%)', grain: 0.12, vignette: 0.16, monoFallback: true },
  { id: 'sepia', name: 'Sepia', className: 'photo-sepia', cssFilter: 'sepia(52%) saturate(92%) brightness(98%) contrast(96%)', grain: 0.06, vignette: 0.1 },
  { id: 'retro-film', name: 'Retro Film', className: 'photo-retro-film', cssFilter: 'sepia(24%) saturate(82%) contrast(92%) brightness(103%)', grain: 0.1, vignette: 0.14 },
  { id: 'dreamy', name: 'Dreamy', className: 'photo-dreamy', cssFilter: 'saturate(108%) brightness(110%) contrast(88%)', bloom: 0.18 },
  { id: 'matte', name: 'Matte', className: 'photo-matte', cssFilter: 'saturate(88%) contrast(84%) brightness(101%)', grain: 0.04 },
  { id: 'pop', name: 'Pop', className: 'photo-pop', cssFilter: 'saturate(145%) contrast(112%) brightness(103%)', bloom: 0.08 },
];

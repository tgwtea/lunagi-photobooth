export type FilterPreset = {
  id: string;
  name: string;
  className: string;
  style?: React.CSSProperties;
};

export const FILTER_PRESETS: FilterPreset[] = [
  { id: 'original', name: 'Original', className: '' },
  { id: 'soft', name: 'Soft', className: 'photo-soft' },
  { id: 'bright', name: 'Bright', className: 'photo-bright' },
  { id: 'warm', name: 'Warm', className: 'photo-warm' },
  { id: 'cool', name: 'Cool', className: 'photo-cool' },
  { id: 'bw', name: 'B&W', className: 'photo-bw' },
];

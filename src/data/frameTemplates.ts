import { LayoutTemplate, FrameVisualPreset } from '../types/frames';

export const FRAME_VISUAL_PRESETS: FrameVisualPreset[] = [
  {
    id: 'white',
    name: 'White Studio',
    backgroundColor: '#FFFFFF',
    borderColor: '#E5E5E5',
    textColor: '#1A1A1A',
  },
  {
    id: 'black',
    name: 'Black Studio',
    backgroundColor: '#1A1A1A',
    borderColor: '#333333',
    textColor: '#FFFFFF',
  },
  {
    id: 'cream',
    name: 'Cream',
    backgroundColor: '#FAF5E9',
    borderColor: '#E5DFD3',
    textColor: '#4A3B32',
  },
  {
    id: 'pink',
    name: 'Soft Pink',
    backgroundColor: '#FFE5EC',
    borderColor: '#F5D3DC',
    textColor: '#8B4F58',
  },
  {
    id: 'blue',
    name: 'Soft Blue',
    backgroundColor: '#E8F0FE',
    borderColor: '#D2E3FC',
    textColor: '#3B5998',
  },
  {
    id: 'lavender',
    name: 'Lavender',
    backgroundColor: '#E6E6FA',
    borderColor: '#D7D7F5',
    textColor: '#5A4E88',
  },
  {
    id: 'classic-film',
    name: 'Classic Film Overlay',
    backgroundColor: '#121212',
    borderColor: '#242424',
    textColor: '#EAEAEA',
    themeId: 'classic-film',
  },
  {
    id: 'vintage-paper',
    name: 'Vintage Paper Overlay',
    backgroundColor: '#FAF4E8',
    borderColor: '#D9CFC1',
    textColor: '#5C4A3C',
    themeId: 'vintage-paper',
  },
  {
    id: 'studio-neon',
    name: 'Studio Neon Glow',
    backgroundColor: '#05050A',
    borderColor: '#00F0FF',
    textColor: '#FF007F',
    themeId: 'studio-neon',
  },
];

export const LAYOUT_TEMPLATES: LayoutTemplate[] = [
  {
    id: 'strip-4',
    name: '4-Cut Vertical Strip',
    outputWidth: 1200,
    outputHeight: 3600,
    photoSlots: [
      { id: 'slot-1', x: 60, y: 80, width: 1080, height: 810 },
      { id: 'slot-2', x: 60, y: 930, width: 1080, height: 810 },
      { id: 'slot-3', x: 60, y: 1780, width: 1080, height: 810 },
      { id: 'slot-4', x: 60, y: 2630, width: 1080, height: 810 },
    ],
  },
  {
    id: 'grid-2x2',
    name: '2x2 Square Grid',
    outputWidth: 2000,
    outputHeight: 2000,
    photoSlots: [
      { id: 'slot-1', x: 100, y: 150, width: 860, height: 645 },
      { id: 'slot-2', x: 1040, y: 150, width: 860, height: 645 },
      { id: 'slot-3', x: 100, y: 875, width: 860, height: 645 },
      { id: 'slot-4', x: 1040, y: 875, width: 860, height: 645 },
    ],
  },
];

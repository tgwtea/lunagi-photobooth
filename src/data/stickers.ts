import { StickerSize } from '../types/booth';

export type StickerAsset = {
  id: string;
  name: string;
  src: string;
};

export const STICKER_SIZE_FRACTIONS: Record<StickerSize, number> = {
  s: 0.08,
  m: 0.13,
  l: 0.2,
};

const stickerModules = import.meta.glob('../assets/stickers/*.{png,webp,svg}', {
  eager: true,
  query: '?url',
  import: 'default',
});

const formatStickerName = (path: string) => {
  const filename = path.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Sticker';
  return filename
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

export const STICKER_ASSETS: StickerAsset[] = Object.entries(stickerModules).map(
  ([path, src]) => ({
    id: path,
    name: formatStickerName(path),
    src: String(src),
  })
);

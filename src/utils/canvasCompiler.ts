import {
  CapturedPhoto,
  CustomizationState,
  EffectId,
  FrameOverrides,
  PhotoTransform,
  PlacedSticker,
} from '../types/booth';
import { FrameLayout, FrameVisualPreset, LayoutTemplate, PhotoSlot } from '../types/frames';
import { LAYOUT_TEMPLATES, FRAME_VISUAL_PRESETS } from '../data/frameTemplates';
import { FILTER_PRESETS, FilterPreset } from '../data/filterPresets';
import { BRAND } from '../data/branding';
import { STICKER_ASSETS, STICKER_SIZE_FRACTIONS } from '../data/stickers';
import { deriveLayout, DerivedLayout, Rect } from './layout';

export const DEFAULT_FRAME_OVERRIDES: FrameOverrides = {
  cornerShape: 'rounded',
  innerGapPx: 40,
  borderPx: 6,
};

export const getCanvasFilter = (filterId: string): string => {
  return FILTER_PRESETS.find((filter) => filter.id === filterId)?.cssFilter || 'none';
};

export const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      img.onload = null;
      img.onerror = null;
      resolve(img);
    };
    img.onerror = (err) => {
      img.onload = null;
      img.onerror = null;
      reject(err);
    };
    img.src = src;
  });
};

const getLayout = (layoutId: FrameLayout): LayoutTemplate =>
  LAYOUT_TEMPLATES.find((template) => template.id === layoutId) || LAYOUT_TEMPLATES[0];

const getPreset = (frameId: string): FrameVisualPreset =>
  FRAME_VISUAL_PRESETS.find((preset) => preset.id === frameId) || FRAME_VISUAL_PRESETS[0];

const getFilter = (filterId: string): FilterPreset =>
  FILTER_PRESETS.find((filter) => filter.id === filterId) || FILTER_PRESETS[0];

const placeholderPhoto = (index: number): CapturedPhoto => ({
  id: `placeholder-${index}`,
  src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="%23e9e8e7"></svg>',
  capturedAt: Date.now(),
  crop: { x: 0, y: 0, width: 600, height: 800, aspectRatio: '3:4' },
});

export const normalizePhotos = (selectedPhotos: CapturedPhoto[]): CapturedPhoto[] => {
  const displayPhotos = [...selectedPhotos];
  while (displayPhotos.length < 4) {
    displayPhotos.push(placeholderPhoto(displayPhotos.length));
  }
  return displayPhotos.slice(0, 4);
};

const createNoiseCanvas = (width: number, height: number, opacity: number): HTMLCanvasElement => {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const noiseCtx = noiseCanvas.getContext('2d');
  if (noiseCtx) {
    const imgData = noiseCtx.createImageData(width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = 90 + Math.floor(Math.random() * 150);
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = Math.floor(Math.random() * 255 * opacity);
    }
    noiseCtx.putImageData(imgData, 0, 0);
  }
  return noiseCanvas;
};

const supportsCanvasFilter = (ctx: CanvasRenderingContext2D) => 'filter' in ctx;

const applyMonoFallback = (ctx: CanvasRenderingContext2D, rect: Rect) => {
  const imageData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
  const data = imageData.data;
  for (let i = 0; i < data.length; i += 4) {
    const grey = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114;
    data[i] = grey;
    data[i + 1] = grey;
    data[i + 2] = grey;
  }
  ctx.putImageData(imageData, rect.x, rect.y);
};

const applyFilterOverlays = (ctx: CanvasRenderingContext2D, rect: Rect, filter: FilterPreset) => {
  if (filter.grain) {
    const noiseCanvas = createNoiseCanvas(128, 128, filter.grain);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalCompositeOperation = 'overlay';
      ctx.fillStyle = pattern;
      ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
      ctx.restore();
    }
    noiseCanvas.width = 0;
    noiseCanvas.height = 0;
  }

  if (filter.vignette) {
    ctx.save();
    const gradient = ctx.createRadialGradient(
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      Math.min(rect.width, rect.height) * 0.24,
      rect.x + rect.width / 2,
      rect.y + rect.height / 2,
      Math.max(rect.width, rect.height) * 0.72
    );
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${filter.vignette})`);
    ctx.fillStyle = gradient;
    ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }

  if (filter.bloom) {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = filter.bloom;
    ctx.filter = 'blur(14px) brightness(118%)';
    ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x, rect.y, rect.width, rect.height);
    ctx.restore();
  }
};

export const drawImageCoverWithTransform = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  x: number,
  y: number,
  w: number,
  h: number,
  transform: PhotoTransform,
  radius?: number
) => {
  const imgRatio = img.width / img.height;
  const slotRatio = w / h;
  let drawW = w;
  let drawH = h;
  let drawX = x;
  let drawY = y;

  if (imgRatio > slotRatio) {
    drawW = h * imgRatio;
    drawX = x - (drawW - w) / 2;
  } else {
    drawH = w / imgRatio;
    drawY = y - (drawH - h) / 2;
  }

  ctx.save();
  if (radius && radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.closePath();
    ctx.clip();
  }

  const centerX = x + w / 2;
  const centerY = y + h / 2;
  ctx.translate(centerX, centerY);
  ctx.translate(transform.offsetX * w, transform.offsetY * h);
  ctx.scale(transform.zoom, transform.zoom);
  ctx.translate(-centerX, -centerY);
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
};

const drawMirror = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: Rect,
  transform: PhotoTransform,
  radius?: number
) => {
  const halfWidth = rect.width / 2;
  drawImageCoverWithTransform(ctx, img, rect.x, rect.y, halfWidth, rect.height, transform, radius);
  ctx.save();
  ctx.beginPath();
  if (radius && radius > 0) {
    ctx.roundRect(rect.x + halfWidth, rect.y, halfWidth, rect.height, radius);
  } else {
    ctx.rect(rect.x + halfWidth, rect.y, halfWidth, rect.height);
  }
  ctx.clip();
  ctx.translate(rect.x + rect.width, 0);
  ctx.scale(-1, 1);
  drawImageCoverWithTransform(ctx, img, rect.x, rect.y, halfWidth, rect.height, transform, radius);
  ctx.restore();
};

const applyEffect = (ctx: CanvasRenderingContext2D, rect: Rect, effectId: EffectId | null) => {
  if (!effectId) return;

  if (effectId === 'pixelate') {
    const pixelCanvas = document.createElement('canvas');
    pixelCanvas.width = Math.max(1, Math.floor(rect.width / 18));
    pixelCanvas.height = Math.max(1, Math.floor(rect.height / 18));
    const pixelCtx = pixelCanvas.getContext('2d');
    if (pixelCtx) {
      pixelCtx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, 0, 0, pixelCanvas.width, pixelCanvas.height);
      ctx.save();
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(pixelCanvas, 0, 0, pixelCanvas.width, pixelCanvas.height, rect.x, rect.y, rect.width, rect.height);
      ctx.restore();
    }
    return;
  }

  if (effectId === 'vhs') {
    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.globalAlpha = 0.18;
    ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x - 5, rect.y, rect.width, rect.height);
    ctx.globalAlpha = 0.14;
    ctx.drawImage(ctx.canvas, rect.x, rect.y, rect.width, rect.height, rect.x + 5, rect.y, rect.width, rect.height);
    ctx.restore();
    ctx.save();
    ctx.fillStyle = 'rgba(255,255,255,0.08)';
    for (let y = rect.y; y < rect.y + rect.height; y += 8) {
      ctx.fillRect(rect.x, y, rect.width, 2);
    }
    ctx.restore();
    return;
  }

  if (effectId === 'thermal') {
    const imageData = ctx.getImageData(rect.x, rect.y, rect.width, rect.height);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const v = (data[i] + data[i + 1] + data[i + 2]) / 3 / 255;
      data[i] = Math.min(255, 60 + v * 270);
      data[i + 1] = Math.max(0, 40 + Math.sin(v * Math.PI) * 210);
      data[i + 2] = Math.max(0, 220 - v * 260);
    }
    ctx.putImageData(imageData, rect.x, rect.y);
  }
};

export const drawPhotoWithLook = (
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  rect: Rect,
  transform: PhotoTransform,
  filterId: string,
  effectId: EffectId | null,
  radius?: number
) => {
  const filter = getFilter(filterId);
  ctx.save();
  if (effectId === 'mirror') {
    if (supportsCanvasFilter(ctx)) ctx.filter = filter.cssFilter;
    drawMirror(ctx, img, rect, transform, radius);
  } else {
    if (supportsCanvasFilter(ctx)) ctx.filter = filter.cssFilter;
    drawImageCoverWithTransform(ctx, img, rect.x, rect.y, rect.width, rect.height, transform, radius);
  }
  ctx.restore();

  if (!supportsCanvasFilter(ctx) && filter.monoFallback) {
    applyMonoFallback(ctx, rect);
  }
  applyFilterOverlays(ctx, rect, filter);
  applyEffect(ctx, rect, effectId);
};

const drawThemeBackground = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  preset: FrameVisualPreset,
  customization: CustomizationState
) => {
  ctx.fillStyle = customization.frameOverrides.backgroundColor || preset.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  if (preset.themeId === 'checkerboard') {
    const size = canvas.width / 12;
    ctx.fillStyle = 'rgba(0,0,0,0.08)';
    for (let y = 0; y < canvas.height; y += size) {
      for (let x = 0; x < canvas.width; x += size) {
        if ((Math.floor(x / size) + Math.floor(y / size)) % 2 === 0) {
          ctx.fillRect(x, y, size, size);
        }
      }
    }
  }
};

const drawSlotBorder = (
  ctx: CanvasRenderingContext2D,
  slot: PhotoSlot,
  radius: number,
  preset: FrameVisualPreset
) => {
  ctx.save();
  if (preset.themeId === 'studio-neon') {
    ctx.strokeStyle = '#FF007F';
    ctx.lineWidth = 6;
    ctx.shadowColor = '#FF007F';
    ctx.shadowBlur = 18;
  } else {
    ctx.strokeStyle = 'rgba(0,0,0,0.08)';
    ctx.lineWidth = 2;
  }
  ctx.beginPath();
  ctx.roundRect(slot.x, slot.y, slot.width, slot.height, radius);
  ctx.stroke();
  ctx.restore();
};

const drawSprockets = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layoutId: FrameLayout,
  variant: 'classic' | 'dense'
) => {
  const isStrip = layoutId === 'strip-4';
  const count = variant === 'dense' ? (isStrip ? 42 : 28) : (isStrip ? 30 : 18);
  const sprocketW = variant === 'dense' ? canvas.width * 0.022 : canvas.width * 0.02;
  const sprocketH = variant === 'dense' ? canvas.height / count * 0.48 : canvas.height / count * 0.42;
  const spacing = canvas.height / count;
  const leftX = variant === 'dense' ? canvas.width * 0.16 : canvas.width * 0.025;
  const rightX = variant === 'dense' ? canvas.width * 0.91 : canvas.width * 0.975;

  ctx.save();
  ctx.fillStyle = variant === 'dense' ? '#EFEFE8' : '#000000';
  for (let i = 0; i < count; i += 1) {
    const y = i * spacing + (spacing - sprocketH) / 2;
    [leftX, rightX].forEach((x) => {
      ctx.beginPath();
      ctx.roundRect(x - sprocketW / 2, y, sprocketW, sprocketH, 6);
      ctx.fill();
    });
  }
  ctx.restore();
};

const drawThemeOverlays = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layoutId: FrameLayout,
  preset: FrameVisualPreset,
  derived: DerivedLayout
) => {
  if (preset.themeId === 'classic-film') {
    drawSprockets(ctx, canvas, layoutId, 'classic');
    ctx.save();
    ctx.fillStyle = '#D5AA47';
    ctx.font = `600 ${layoutId === 'strip-4' ? 24 : 30}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    for (let i = 0; i < derived.photoSlots.length; i += 1) {
      const slot = derived.photoSlots[i];
      ctx.fillText(`LNG ${String(i + 1).padStart(2, '0')}`, slot.x + slot.width / 2, slot.y - 20);
    }
    ctx.restore();
  }

  if (preset.themeId === 'film-35mm') {
    drawSprockets(ctx, canvas, layoutId, 'dense');
    ctx.save();
    ctx.fillStyle = '#F3F0E7';
    ctx.font = `700 ${layoutId === 'strip-4' ? 34 : 40}px "JetBrains Mono", monospace`;
    ctx.textAlign = 'center';
    ctx.translate(canvas.width * 0.065, canvas.height / 2);
    ctx.rotate(-Math.PI / 2);
    ctx.fillText(BRAND.wordmark, 0, 0);
    ctx.restore();
  }

  if (preset.themeId === 'vintage-paper') {
    const noiseCanvas = createNoiseCanvas(128, 128, 0.06);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      ctx.save();
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
    noiseCanvas.width = 0;
    noiseCanvas.height = 0;
  }
};

const fontForChoice = (fontFamily: string) => {
  if (fontFamily === 'Playfair Display') return '"Playfair Display", Georgia, serif';
  if (fontFamily === 'JetBrains Mono') return '"JetBrains Mono", monospace';
  if (fontFamily === 'Great Vibes') return '"Great Vibes", cursive';
  return 'Inter, -apple-system, sans-serif';
};

const drawCaption = (
  ctx: CanvasRenderingContext2D,
  customization: CustomizationState,
  preset: FrameVisualPreset,
  derived: DerivedLayout
) => {
  const text = customization.caption.text.trim().slice(0, 24);
  if (!text) return;

  const style = preset.captionStyle;
  const isThemeCaption = !!style;
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = style?.color || preset.textColor || '#1A1A1A';
  const fontFamily = style?.fontFamily || fontForChoice(customization.caption.fontFamily);
  const fontSize = derived.id === 'strip-4' ? 28 : 38;
  ctx.font = `${isThemeCaption ? '700' : '600'} ${fontSize}px ${fontFamily}`;
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = style?.letterSpacing || (customization.caption.fontFamily === 'Great Vibes' ? '0.02em' : '0.12em');
  }
  const captionText = (style?.textTransform || 'uppercase') === 'uppercase' ? text.toUpperCase() : text;
  derived.gapRects.forEach((gap) => {
    if (gap.height >= 18) {
      ctx.fillText(captionText, gap.x + gap.width / 2, gap.y + gap.height / 2);
    }
  });
  ctx.restore();
};

const drawFooterBranding = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  layoutId: FrameLayout,
  preset: FrameVisualPreset
) => {
  const isStrip = layoutId === 'strip-4';
  const y = isStrip ? canvas.height - 78 : canvas.height - 92;
  const color = preset.textColor || '#1A1A1A';

  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  if ((preset.brandingMode || 'footer-full') === 'footer-full') {
    ctx.font = `700 ${isStrip ? 36 : 46}px Inter, -apple-system, sans-serif`;
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.28em';
    ctx.fillText(BRAND.wordmark, canvas.width / 2, y);
    ctx.globalAlpha = 0.72;
    ctx.font = `500 ${isStrip ? 22 : 28}px Inter, -apple-system, sans-serif`;
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.14em';
    ctx.fillText(BRAND.url, canvas.width / 2, y + (isStrip ? 42 : 52));
  } else {
    ctx.globalAlpha = 0.78;
    ctx.font = `600 ${isStrip ? 24 : 30}px Inter, -apple-system, sans-serif`;
    if ('letterSpacing' in ctx) (ctx as any).letterSpacing = '0.14em';
    ctx.fillText(BRAND.url, canvas.width / 2, y + 24);
  }
  ctx.restore();
};

export const drawBrandWatermark = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, height - 58, width, 58);
  ctx.fillStyle = '#FFFFFF';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '700 15px Inter, -apple-system, sans-serif';
  ctx.fillText(BRAND.wordmark, 18, height - 34);
  ctx.globalAlpha = 0.72;
  ctx.font = '500 12px Inter, -apple-system, sans-serif';
  ctx.fillText(BRAND.url, 18, height - 16);
  ctx.restore();
};

const drawOuterBorder = (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  preset: FrameVisualPreset,
  borderPx: number
) => {
  if (borderPx <= 0) return;
  ctx.save();
  if (preset.themeId === 'studio-neon') {
    ctx.strokeStyle = '#00F0FF';
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 24;
  } else {
    ctx.strokeStyle = preset.borderColor || 'rgba(0,0,0,0.12)';
  }
  ctx.lineWidth = borderPx;
  ctx.strokeRect(borderPx / 2, borderPx / 2, canvas.width - borderPx, canvas.height - borderPx);
  ctx.restore();
};

const drawStickers = async (
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  placedStickers: PlacedSticker[]
) => {
  await Promise.all(
    placedStickers.map(async (sticker) => {
      const asset = STICKER_ASSETS.find((item) => item.id === sticker.assetId);
      if (!asset) return;
      const img = await loadImage(asset.src);
      const width = STICKER_SIZE_FRACTIONS[sticker.size] * canvas.width;
      const height = width * (img.height / img.width);
      const x = Math.max(0, Math.min(canvas.width, sticker.cx * canvas.width)) - width / 2;
      const y = Math.max(0, Math.min(canvas.height, sticker.cy * canvas.height)) - height / 2;
      ctx.drawImage(img, x, y, width, height);
    })
  );
};

export const compileFrameCanvas = async (
  selectedPhotos: CapturedPhoto[],
  customization: CustomizationState,
  opts: { layoutOverride?: FrameLayout } = {}
): Promise<HTMLCanvasElement> => {
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading failed, compiling with fallback fonts', e);
    }
  }

  const layoutId = opts.layoutOverride || customization.layout;
  const template = getLayout(layoutId);
  const preset = getPreset(customization.frameId);
  const derived = deriveLayout(
    template,
    customization.frameOverrides,
    preset.geometryVariant || 'standard'
  );
  const canvas = document.createElement('canvas');
  canvas.width = derived.outputWidth;
  canvas.height = derived.outputHeight;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not get 2D context');

  drawThemeBackground(ctx, canvas, preset, customization);

  const displayPhotos = normalizePhotos(selectedPhotos);
  const loadedImages = await Promise.all(displayPhotos.map((photo) => loadImage(photo.src)));

  derived.photoSlots.forEach((slot, index) => {
    const photo = displayPhotos[index];
    const transform = customization.photoTransforms[photo.id] || { zoom: 1, offsetX: 0, offsetY: 0 };
    drawPhotoWithLook(
      ctx,
      loadedImages[index],
      { x: slot.x, y: slot.y, width: slot.width, height: slot.height },
      transform,
      customization.filterId,
      customization.effectId,
      derived.slotRadius
    );
    drawSlotBorder(ctx, slot, derived.slotRadius, preset);
  });

  drawCaption(ctx, customization, preset, derived);
  drawThemeOverlays(ctx, canvas, layoutId, preset, derived);
  drawOuterBorder(ctx, canvas, preset, derived.borderPx);
  await drawStickers(ctx, canvas, customization.placedStickers);
  drawFooterBranding(ctx, canvas, layoutId, preset);

  return canvas;
};

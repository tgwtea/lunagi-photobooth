import React, { useEffect, useMemo, useState } from 'react';
import { CapturedPhoto, CustomizationState, PhotoTransform, PlacedSticker } from '../../types/booth';
import { FRAME_VISUAL_PRESETS, LAYOUT_TEMPLATES } from '../../data/frameTemplates';
import { FILTER_PRESETS } from '../../data/filterPresets';
import { BRAND } from '../../data/branding';
import { STICKER_ASSETS, STICKER_SIZE_FRACTIONS } from '../../data/stickers';
import { deriveLayout, Rect } from '../../utils/layout';
import { normalizePhotos } from '../../utils/canvasCompiler';

type FramePreviewProps = {
  selectedPhotos: CapturedPhoto[];
  customization: CustomizationState;
  activePhotoId?: string;
  onSelectPhoto?: (photoId: string) => void;
  onChangeTransform?: (photoId: string, transform: PhotoTransform) => void;
  onChangeSticker?: (sticker: PlacedSticker) => void;
  onDeleteSticker?: (stickerId: string) => void;
};

type DragState =
  | {
      type: 'photo';
      id: string;
      startX: number;
      startY: number;
      initialOffsetX: number;
      initialOffsetY: number;
      slotWidth: number;
      slotHeight: number;
    }
  | {
      type: 'sticker';
      id: string;
      startX: number;
      startY: number;
      initialCx: number;
      initialCy: number;
      frameWidth: number;
      frameHeight: number;
    };

const getFontFamily = (font: string) => {
  if (font === 'Playfair Display') return "'Playfair Display', Georgia, serif";
  if (font === 'JetBrains Mono') return "'JetBrains Mono', monospace";
  if (font === 'Great Vibes') return "'Great Vibes', cursive";
  return "'Inter', sans-serif";
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export const FramePreview: React.FC<FramePreviewProps> = ({
  selectedPhotos,
  customization,
  activePhotoId,
  onSelectPhoto,
  onChangeTransform,
  onChangeSticker,
  onDeleteSticker,
}) => {
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [longPressTimer, setLongPressTimer] = useState<number | null>(null);

  const layoutTemplate =
    LAYOUT_TEMPLATES.find((template) => template.id === customization.layout) || LAYOUT_TEMPLATES[0];
  const visualPreset =
    FRAME_VISUAL_PRESETS.find((preset) => preset.id === customization.frameId) || FRAME_VISUAL_PRESETS[0];
  const activeFilter = FILTER_PRESETS.find((filter) => filter.id === customization.filterId);
  const derived = useMemo(
    () =>
      deriveLayout(
        layoutTemplate,
        customization.frameOverrides,
        visualPreset.geometryVariant || 'standard'
      ),
    [layoutTemplate, customization.frameOverrides, visualPreset.geometryVariant]
  );
  const displayPhotos = useMemo(() => normalizePhotos(selectedPhotos), [selectedPhotos]);
  const isStrip = customization.layout === 'strip-4';
  const frameWidth = isStrip ? 320 : 380;
  const frameHeight = frameWidth * (derived.outputHeight / derived.outputWidth);
  const scaleX = frameWidth / derived.outputWidth;
  const scaleY = frameHeight / derived.outputHeight;
  const filterClass = activeFilter?.className || '';
  const captionText = customization.caption.text.trim().slice(0, 24);
  const captionStyle = visualPreset.captionStyle;

  const scaledRect = (rect: Rect) => ({
    left: rect.x * scaleX,
    top: rect.y * scaleY,
    width: rect.width * scaleX,
    height: rect.height * scaleY,
  });

  const handlePhotoDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    photoId: string
  ) => {
    if (!onChangeTransform || photoId.startsWith('placeholder-')) return;
    onSelectPhoto?.(photoId);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    const rect = e.currentTarget.getBoundingClientRect();
    const transform = customization.photoTransforms[photoId] || { zoom: 1, offsetX: 0, offsetY: 0 };
    setDragState({
      type: 'photo',
      id: photoId,
      startX: clientX,
      startY: clientY,
      initialOffsetX: transform.offsetX,
      initialOffsetY: transform.offsetY,
      slotWidth: rect.width || 1,
      slotHeight: rect.height || 1,
    });
    if (e.cancelable) e.preventDefault();
  };

  const handleStickerDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    sticker: PlacedSticker
  ) => {
    if (!onChangeSticker) return;
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    setDragState({
      type: 'sticker',
      id: sticker.id,
      startX: clientX,
      startY: clientY,
      initialCx: sticker.cx,
      initialCy: sticker.cy,
      frameWidth,
      frameHeight,
    });
    const timer = window.setTimeout(() => onDeleteSticker?.(sticker.id), 650);
    setLongPressTimer(timer);
    if (e.cancelable) e.preventDefault();
  };

  useEffect(() => {
    if (!dragState) return;

    const handleMove = (clientX: number, clientY: number) => {
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }

      if (dragState.type === 'photo') {
        if (!onChangeTransform) return;
        const dx = clientX - dragState.startX;
        const dy = clientY - dragState.startY;
        const transform = customization.photoTransforms[dragState.id] || { zoom: 1, offsetX: 0, offsetY: 0 };
        onChangeTransform(dragState.id, {
          ...transform,
          offsetX: clamp(dragState.initialOffsetX + dx / dragState.slotWidth, -1, 1),
          offsetY: clamp(dragState.initialOffsetY + dy / dragState.slotHeight, -1, 1),
        });
      } else {
        if (!onChangeSticker) return;
        const sticker = customization.placedStickers.find((item) => item.id === dragState.id);
        if (!sticker) return;
        onChangeSticker({
          ...sticker,
          cx: clamp(dragState.initialCx + (clientX - dragState.startX) / dragState.frameWidth, 0, 1),
          cy: clamp(dragState.initialCy + (clientY - dragState.startY) / dragState.frameHeight, 0, 1),
        });
      }
    };

    const handleMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };
    const handleDragEnd = () => {
      if (longPressTimer) {
        window.clearTimeout(longPressTimer);
        setLongPressTimer(null);
      }
      setDragState(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleDragEnd);
    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    window.addEventListener('touchend', handleDragEnd);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleDragEnd);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchend', handleDragEnd);
    };
  }, [dragState, longPressTimer, onChangeSticker, onChangeTransform, customization.photoTransforms, customization.placedStickers]);

  const renderSprockets = (dense: boolean) => {
    const count = dense ? (isStrip ? 42 : 28) : (isStrip ? 30 : 18);
    const left = dense ? '15%' : '2%';
    const right = dense ? '90%' : '96%';
    return (
      <>
        {[left, right].map((x) => (
          <div key={x} className="absolute top-0 bottom-0 flex flex-col justify-around" style={{ left: x }}>
            {Array.from({ length: count }).map((_, index) => (
              <div
                key={index}
                className={`${dense ? 'w-2 h-2.5 bg-[#f0efe8]' : 'w-2 h-3.5 bg-black'} rounded-[2px] opacity-90`}
              />
            ))}
          </div>
        ))}
      </>
    );
  };

  const renderCaption = () => {
    if (!captionText) return null;
    const style = {
      color: captionStyle?.color || visualPreset.textColor || '#1A1A1A',
      fontFamily: captionStyle?.fontFamily || getFontFamily(customization.caption.fontFamily),
      letterSpacing:
        captionStyle?.letterSpacing ||
        (customization.caption.fontFamily === 'Great Vibes' ? '0.02em' : '0.12em'),
      textTransform: captionStyle?.textTransform || 'uppercase',
    } as React.CSSProperties;

    return derived.gapRects.map((gap, index) => {
      if (gap.height <= 0) return null;
      const rect = scaledRect(gap);
      return (
        <div
          key={index}
          className="absolute flex items-center justify-center text-[9px] sm:text-[10px] font-bold pointer-events-none text-center"
          style={{ ...rect, ...style }}
        >
          {captionText}
        </div>
      );
    });
  };

  const renderBranding = () => {
    const urlOnly = visualPreset.brandingMode === 'footer-url-only';
    return (
      <div
        className="absolute left-0 right-0 bottom-0 flex flex-col items-center justify-center text-center pointer-events-none"
        style={{ height: frameHeight * 0.07, color: visualPreset.textColor || '#111111' }}
      >
        {!urlOnly && (
          <div className="font-sans text-[10px] font-bold tracking-[0.25em] uppercase">
            {BRAND.wordmark}
          </div>
        )}
        <div className="font-sans text-[8px] font-semibold tracking-[0.14em] opacity-75">
          {BRAND.url}
        </div>
      </div>
    );
  };

  return (
    <div
      className="relative overflow-hidden rounded-sm shadow-[0_20px_40px_rgba(0,0,0,0.08)] border border-black/10 select-none"
      style={{
        width: frameWidth,
        height: frameHeight,
        backgroundColor: customization.frameOverrides.backgroundColor || visualPreset.backgroundColor,
        borderColor: visualPreset.borderColor,
        boxShadow:
          visualPreset.themeId === 'studio-neon'
            ? '0 0 24px rgba(0, 240, 255, 0.35), inset 0 0 14px rgba(255, 0, 127, 0.22)'
            : undefined,
      }}
    >
      {visualPreset.themeId === 'checkerboard' && (
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(-45deg, rgba(0,0,0,0.08) 25%, transparent 25%), linear-gradient(45deg, transparent 75%, rgba(0,0,0,0.08) 75%), linear-gradient(-45deg, transparent 75%, rgba(0,0,0,0.08) 75%)',
            backgroundSize: '32px 32px',
            backgroundPosition: '0 0, 0 16px, 16px -16px, -16px 0px',
          }}
        />
      )}

      {visualPreset.themeId === 'classic-film' && renderSprockets(false)}
      {visualPreset.themeId === 'film-35mm' && (
        <>
          {renderSprockets(true)}
          <div className="absolute left-2 top-1/2 -translate-y-1/2 -rotate-90 origin-center text-[10px] font-bold tracking-[0.18em] text-[#f3f0e7] whitespace-nowrap pointer-events-none">
            {BRAND.wordmark}
          </div>
        </>
      )}

      {derived.photoSlots.map((slot, index) => {
        const photo = displayPhotos[index];
        const transform = customization.photoTransforms[photo.id] || { zoom: 1, offsetX: 0, offsetY: 0 };
        const rect = scaledRect(slot);
        const radius = derived.slotRadius * scaleX;
        const isActive = activePhotoId === photo.id;
        return (
          <div
            key={`${photo.id}-${slot.id}`}
            className={`absolute overflow-hidden bg-neutral-100 cursor-move border ${
              visualPreset.themeId === 'studio-neon'
                ? 'border-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,0.5)]'
                : 'border-black/10'
            } ${isActive ? 'ring-2 ring-primary ring-offset-2' : ''}`}
            style={{ ...rect, borderRadius: radius }}
            onMouseDown={(e) => handlePhotoDragStart(e, photo.id)}
            onTouchStart={(e) => handlePhotoDragStart(e, photo.id)}
          >
            <img
              src={photo.src}
              alt={`Photo ${index + 1}`}
              className={`w-full h-full object-cover pointer-events-none select-none ${filterClass}`}
              style={{
                transform: `translate(${transform.offsetX * 100}%, ${transform.offsetY * 100}%) scale(${transform.zoom})`,
                transformOrigin: 'center center',
              }}
            />
          </div>
        );
      })}

      {renderCaption()}

      {customization.placedStickers.map((sticker) => {
        const asset = STICKER_ASSETS.find((item) => item.id === sticker.assetId);
        if (!asset) return null;
        const width = STICKER_SIZE_FRACTIONS[sticker.size] * frameWidth;
        return (
          <div
            key={sticker.id}
            className="absolute z-20 cursor-grab active:cursor-grabbing"
            style={{
              left: sticker.cx * frameWidth - width / 2,
              top: sticker.cy * frameHeight - width / 2,
              width,
            }}
            onMouseDown={(e) => handleStickerDragStart(e, sticker)}
            onTouchStart={(e) => handleStickerDragStart(e, sticker)}
            title="Drag sticker. Hold to delete."
          >
            <img src={asset.src} alt={asset.name} className="w-full h-auto pointer-events-none select-none" />
          </div>
        );
      })}

      {renderBranding()}
    </div>
  );
};

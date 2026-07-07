import React, { useState, useEffect, useMemo } from 'react';
import { CapturedPhoto, PhotoTransform, FooterCustomization } from '../../types/booth';
import { LayoutTemplate, FrameVisualPreset } from '../../types/frames';
import { FILTER_PRESETS } from '../../data/filterPresets';

type FramePreviewProps = {
  selectedPhotos: CapturedPhoto[];
  layoutTemplate: LayoutTemplate;
  visualPreset: FrameVisualPreset;
  filterId: string;
  photoTransforms?: Record<string, PhotoTransform>;
  activePhotoId?: string;
  onSelectPhoto?: (photoId: string) => void;
  onChangeTransform?: (photoId: string, transform: PhotoTransform) => void;
  footer?: FooterCustomization;
};

type DragState = {
  startX: number;
  startY: number;
  initialOffsetX: number;
  initialOffsetY: number;
  slotWidth: number;
  slotHeight: number;
};

export const FramePreview: React.FC<FramePreviewProps> = ({
  selectedPhotos,
  layoutTemplate,
  visualPreset,
  filterId,
  photoTransforms = {},
  activePhotoId,
  onSelectPhoto,
  onChangeTransform,
  footer,
}) => {
  // Find active filter class
  const activeFilter = FILTER_PRESETS.find((f) => f.id === filterId);
  const filterClass = activeFilter ? activeFilter.className : '';

  // Drag states
  const [dragState, setDragState] = useState<DragState | null>(null);
  const [activeDragId, setActiveDragId] = useState<string | null>(null);

  // Standardize photos to always have 4 elements (fallback placeholders)
  const displayPhotos = useMemo(() => {
    const list = [...selectedPhotos];
    while (list.length < 4) {
      list.push({
        id: `placeholder-${list.length}`,
        src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="%23e9e8e7"></svg>',
        capturedAt: Date.now(),
        crop: { x: 0, y: 0, width: 600, height: 800, aspectRatio: '3:4' },
      });
    }
    return list;
  }, [selectedPhotos]);

  // Handle Drag Start
  const handleDragStart = (
    e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>,
    photoId: string
  ) => {
    if (!onChangeTransform) return;
    
    // Select this photo as active for edit panel
    onSelectPhoto?.(photoId);

    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const transform = photoTransforms[photoId] || { zoom: 1, offsetX: 0, offsetY: 0 };

    setDragState({
      startX: clientX,
      startY: clientY,
      initialOffsetX: transform.offsetX,
      initialOffsetY: transform.offsetY,
      slotWidth: rect.width || 1,
      slotHeight: rect.height || 1,
    });
    setActiveDragId(photoId);

    if (e.cancelable) {
      e.preventDefault();
    }
  };

  // Window listeners for dragging
  useEffect(() => {
    if (!activeDragId || !dragState || !onChangeTransform) return;

    const handleMove = (clientX: number, clientY: number) => {
      const dx = clientX - dragState.startX;
      const dy = clientY - dragState.startY;
      
      const relDx = dx / dragState.slotWidth;
      const relDy = dy / dragState.slotHeight;

      const transform = photoTransforms[activeDragId] || { zoom: 1, offsetX: 0, offsetY: 0 };
      
      // Limit panning relative to zoom level to keep image visible
      const maxOffset = 1.0; 
      onChangeTransform(activeDragId, {
        ...transform,
        offsetX: Math.max(-maxOffset, Math.min(maxOffset, dragState.initialOffsetX + relDx)),
        offsetY: Math.max(-maxOffset, Math.min(maxOffset, dragState.initialOffsetY + relDy)),
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      handleMove(e.clientX, e.clientY);
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        handleMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const handleDragEnd = () => {
      setDragState(null);
      setActiveDragId(null);
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
  }, [activeDragId, dragState, photoTransforms, onChangeTransform]);

  // Determine border styles
  const borderStyles = visualPreset.borderColor
    ? { borderColor: visualPreset.borderColor, borderStyle: 'solid', borderWidth: '1px' }
    : {};

  // Formatted Date Stamp
  const dateStamp = useMemo(() => {
    if (!footer?.showDate) return '';
    const dateObj = selectedPhotos[0]?.capturedAt
      ? new Date(selectedPhotos[0].capturedAt)
      : new Date();
    const yyyy = dateObj.getFullYear();
    const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
    const dd = String(dateObj.getDate()).padStart(2, '0');
    return `${yyyy}.${mm}.${dd}`;
  }, [footer?.showDate, selectedPhotos]);

  // Footer Style Helpers
  const footerFontFamily = useMemo(() => {
    switch (footer?.fontFamily) {
      case 'Playfair Display':
        return "'Playfair Display', Georgia, serif";
      case 'JetBrains Mono':
        return "'JetBrains Mono', monospace";
      case 'Great Vibes':
        return "'Great Vibes', cursive";
      default:
        return "'Inter', sans-serif";
    }
  }, [footer?.fontFamily]);

  const footerColor = footer?.color || visualPreset.textColor || '#1A1A1A';

  const footerAlignClass = useMemo(() => {
    switch (footer?.alignment) {
      case 'left':
        return 'text-left px-4';
      case 'right':
        return 'text-right px-4';
      default:
        return 'text-center';
    }
  }, [footer?.alignment]);

  // Sprockets count
  const isStrip = layoutTemplate.id === 'strip-4';

  const renderSprocketHoles = (count: number) => {
    return (
      <div className="flex flex-col justify-between h-full py-2">
        {Array.from({ length: count }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-3 sm:w-2 sm:h-3.5 bg-black border border-white/5 rounded-[1px] opacity-75"
          />
        ))}
      </div>
    );
  };

  // Render Theme Overlays
  const renderThemeOverlay = () => {
    if (visualPreset.themeId === 'vintage-paper') {
      return (
        <>
          {/* Paper grain SVG overlay */}
          <div
            className="absolute inset-0 pointer-events-none mix-blend-multiply opacity-50 rounded-sm"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/><feColorMatrix type='matrix' values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.1 0'/></filter><rect width='120' height='120' filter='url(%23n)'/></svg>")`
            }}
          />
          {/* Subtle warm retro vignette shadow */}
          <div className="absolute inset-0 pointer-events-none rounded-sm bg-[radial-gradient(circle,transparent_55%,rgba(92,74,60,0.1)_100%)]" />
        </>
      );
    }
    return null;
  };

  const renderPhotos = () => {
    return displayPhotos.map((photo, index) => {
      const transform = photoTransforms[photo.id] || { zoom: 1, offsetX: 0, offsetY: 0 };
      const isActive = activePhotoId === photo.id;
      const isPlaceholder = photo.id.startsWith('placeholder-');

      // Glow style for neon theme
      const slotBorderThemeClass =
        visualPreset.themeId === 'studio-neon'
          ? 'border-2 border-[#FF007F] shadow-[0_0_10px_rgba(255,0,127,0.4)]'
          : 'border border-black/5';

      return (
        <div
          key={photo.id + '-' + index}
          onMouseDown={(e) => !isPlaceholder && handleDragStart(e, photo.id)}
          onTouchStart={(e) => !isPlaceholder && handleDragStart(e, photo.id)}
          className={`w-full aspect-[4/3] bg-neutral-100 rounded-[2px] overflow-hidden relative select-none cursor-move transition-shadow duration-200 group ${slotBorderThemeClass} ${
            isActive ? 'ring-2 ring-offset-2 ring-primary' : 'hover:ring-1 hover:ring-primary/50'
          }`}
        >
          <img
            src={photo.src}
            alt={`Photo ${index + 1}`}
            className={`w-full h-full object-cover select-none pointer-events-none ${filterClass}`}
            style={{
              transform: `translate(${transform.offsetX * 100}%, ${transform.offsetY * 100}%) scale(${transform.zoom})`,
              transformOrigin: 'center center',
              transition: activeDragId === photo.id ? 'none' : 'transform 0.15s ease-out',
            }}
          />

          {/* Hover overlay hint */}
          {!isPlaceholder && (
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <div className="bg-black/60 rounded-full p-1.5 text-white flex items-center gap-1.5 shadow-md">
                <span className="material-symbols-outlined text-sm">open_with</span>
                <span className="text-[9px] font-sans font-semibold tracking-wider uppercase pr-1">Drag to Pan</span>
              </div>
            </div>
          )}

          {/* Slot marker */}
          <div className="absolute top-1.5 left-1.5 bg-black/60 text-white rounded-full w-4 h-4 flex items-center justify-center text-[9px] font-sans font-semibold pointer-events-none">
            {index + 1}
          </div>
        </div>
      );
    });
  };

  const renderSignature = () => {
    return (
      <div className={`pt-4 pb-2 ${footerAlignClass} select-none`}>
        <div
          className="font-sans font-semibold text-[10px] sm:text-xs uppercase tracking-[0.25em]"
          style={{
            fontFamily: footerFontFamily,
            color: footerColor,
            textTransform: footer?.fontFamily === 'Great Vibes' ? 'none' : 'uppercase',
            letterSpacing: footer?.fontFamily === 'Great Vibes' ? '0.05em' : '0.25em',
            fontSize: footer?.fontFamily === 'Great Vibes' ? '18px' : undefined,
          }}
        >
          {footer?.text || 'LUNAGI STUDIOS'}
        </div>
        {dateStamp && (
          <div
            className="text-[8px] sm:text-[9px] tracking-widest mt-1 opacity-70"
            style={{
              fontFamily: footer?.fontFamily === 'JetBrains Mono' ? "'JetBrains Mono', monospace" : "'Inter', sans-serif",
              color: footerColor,
            }}
          >
            {dateStamp}
          </div>
        )}
      </div>
    );
  };

  // Base style configuration for different themes
  const containerThemeStyles = useMemo(() => {
    const styles: React.CSSProperties = {
      backgroundColor: visualPreset.backgroundColor,
      color: visualPreset.textColor,
      ...borderStyles,
    };

    if (visualPreset.themeId === 'studio-neon') {
      styles.borderColor = '#00F0FF';
      styles.borderWidth = '2px';
      styles.borderStyle = 'solid';
      styles.boxShadow = '0 0 20px rgba(0, 240, 255, 0.4), inset 0 0 10px rgba(255, 0, 127, 0.2)';
    }

    return styles;
  }, [visualPreset, borderStyles]);

  if (isStrip) {
    return (
      <div
        className="w-[280px] sm:w-[320px] aspect-[1/3] p-4 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[#E5E5E5]/20 rounded-sm relative overflow-hidden select-none"
        style={containerThemeStyles}
      >
        {/* Sprockets Overlay for Film */}
        {visualPreset.themeId === 'classic-film' && (
          <>
            <div className="absolute top-0 bottom-0 left-1 w-2.5">
              {renderSprocketHoles(15)}
            </div>
            <div className="absolute top-0 bottom-0 right-1 w-2.5">
              {renderSprocketHoles(15)}
            </div>
          </>
        )}

        {/* Photos Stack */}
        <div className={`flex flex-col gap-2.5 ${visualPreset.themeId === 'classic-film' ? 'px-3.5' : ''}`}>
          {renderPhotos()}
        </div>

        {/* Branding Footer */}
        {renderSignature()}

        {/* Themed Overlay */}
        {renderThemeOverlay()}

        {/* Dynamic transparent overlay image drawn on top of everything */}
        {visualPreset.overlayImageSrc && (
          <img
            src={visualPreset.overlayImageSrc}
            alt="Frame Overlay"
            className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
          />
        )}
      </div>
    );
  }

  // 2x2 Square Grid
  return (
    <div
      className="w-[300px] sm:w-[360px] aspect-square p-5 flex flex-col justify-between shadow-[0_20px_40px_rgba(0,0,0,0.06)] border border-[#E5E5E5]/20 rounded-sm relative overflow-hidden select-none"
      style={containerThemeStyles}
    >
      {/* Sprockets Overlay for Film */}
      {visualPreset.themeId === 'classic-film' && (
        <>
          <div className="absolute top-0 bottom-0 left-1 w-2.5">
            {renderSprocketHoles(10)}
          </div>
          <div className="absolute top-0 bottom-0 right-1 w-2.5">
            {renderSprocketHoles(10)}
          </div>
        </>
      )}

      {/* 2x2 Grid container */}
      <div className={`grid grid-cols-2 gap-3 ${visualPreset.themeId === 'classic-film' ? 'px-3.5' : ''}`}>
        {renderPhotos()}
      </div>

      {/* Branding Footer */}
      {renderSignature()}

      {/* Themed Overlay */}
      {renderThemeOverlay()}

      {/* Dynamic transparent overlay image drawn on top of everything */}
      {visualPreset.overlayImageSrc && (
        <img
          src={visualPreset.overlayImageSrc}
          alt="Frame Overlay"
          className="absolute inset-0 w-full h-full object-fill pointer-events-none z-20"
        />
      )}
    </div>
  );
};

import { CapturedPhoto, PhotoTransform, FooterCustomization } from '../types/booth';
import { FrameLayout } from '../types/frames';
import { LAYOUT_TEMPLATES, FRAME_VISUAL_PRESETS } from '../data/frameTemplates';

export const getCanvasFilter = (filterId: string): string => {
  switch (filterId) {
    case 'bw':
      return 'grayscale(100%)';
    case 'soft':
      return 'saturate(85%) brightness(102%) contrast(95%)';
    case 'bright':
      return 'brightness(110%) contrast(105%)';
    case 'warm':
      return 'sepia(15%) saturate(110%) brightness(102%)';
    case 'cool':
      return 'hue-rotate(10deg) saturate(95%) brightness(102%)';
    default:
      return 'none';
  }
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

// Generates an in-memory noise canvas for vintage paper texture overlay
const createNoiseCanvas = (width: number, height: number, opacity: number): HTMLCanvasElement => {
  const noiseCanvas = document.createElement('canvas');
  noiseCanvas.width = width;
  noiseCanvas.height = height;
  const noiseCtx = noiseCanvas.getContext('2d');
  if (noiseCtx) {
    const imgData = noiseCtx.createImageData(width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const val = 120 + Math.floor(Math.random() * 110); // soft warm paper grain spectrum
      data[i] = val; // R
      data[i + 1] = val - 5; // G (slightly warmer)
      data[i + 2] = val - 15; // B (yellowish paper tone)
      data[i + 3] = Math.floor(Math.random() * 255 * opacity); // Opacity noise
    }
    noiseCtx.putImageData(imgData, 0, 0);
  }
  return noiseCanvas;
};

// Drawing helper supporting Object-Cover sizing, zoom and translation (panning) offsets
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
    // Image is wider than slot: height matches slot, width is larger
    drawW = h * imgRatio;
    drawX = x - (drawW - w) / 2;
  } else {
    // Image is taller than slot: width matches slot, height is larger
    drawH = w / imgRatio;
    drawY = y - (drawH - h) / 2;
  }

  ctx.save();
  // 1. Clip to slot rounded rectangle boundary
  if (radius && radius > 0) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, radius);
    ctx.closePath();
    ctx.clip();
  }

  // 2. Translate and scale centered on the slot
  const centerX = x + w / 2;
  const centerY = y + h / 2;

  ctx.translate(centerX, centerY);
  // Panning translations are relative to the slot dimensions
  ctx.translate(transform.offsetX * w, transform.offsetY * h);
  ctx.scale(transform.zoom, transform.zoom);
  ctx.translate(-centerX, -centerY);

  // 3. Draw the image
  ctx.drawImage(img, drawX, drawY, drawW, drawH);
  ctx.restore();
};

export const compileFrameCanvas = async (
  layoutId: FrameLayout,
  selectedPhotos: CapturedPhoto[],
  frameId: string,
  filterId: string,
  photoTransforms: Record<string, PhotoTransform> = {},
  footer?: FooterCustomization
): Promise<HTMLCanvasElement> => {
  // Wait for web fonts (e.g. Playfair Display, Great Vibes) to be fully loaded
  if (typeof document !== 'undefined' && 'fonts' in document) {
    try {
      await document.fonts.ready;
    } catch (e) {
      console.warn('Font loading failed, compiling with fallback fonts', e);
    }
  }

  const currentLayout =
    LAYOUT_TEMPLATES.find((t) => t.id === layoutId) || LAYOUT_TEMPLATES[0];
  const currentPreset =
    FRAME_VISUAL_PRESETS.find((p) => p.id === frameId) || FRAME_VISUAL_PRESETS[0];

  const canvas = document.createElement('canvas');
  canvas.width = currentLayout.outputWidth;
  canvas.height = currentLayout.outputHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Could not get 2D context');
  }

  // 1. Draw Background
  ctx.fillStyle = currentPreset.backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // 2. Prepare Display Photos (filling with placeholder if < 4)
  const displayPhotos = [...selectedPhotos];
  while (displayPhotos.length < 4) {
    displayPhotos.push({
      id: `placeholder-${displayPhotos.length}`,
      src: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 800" fill="%23e9e8e7"></svg>',
      capturedAt: Date.now(),
      crop: { x: 0, y: 0, width: 600, height: 800, aspectRatio: '3:4' },
    });
  }

  // 3. Load Images in parallel
  const loadedImages = await Promise.all(
    displayPhotos.map((photo) => loadImage(photo.src))
  );

  // 4. Draw each photo into its slot with transforms
  const filterString = getCanvasFilter(filterId);
  const slotRadius = 8; // 8px proportional corner rounding for high-res slots

  currentLayout.photoSlots.forEach((slot, index) => {
    const photo = displayPhotos[index];
    const img = loadedImages[index];
    const transform = photoTransforms[photo.id] || { zoom: 1, offsetX: 0, offsetY: 0 };

    if (img) {
      ctx.save();
      // Apply filter for photos
      ctx.filter = filterString;
      
      // Draw image with zoom and pan transforms
      drawImageCoverWithTransform(ctx, img, slot.x, slot.y, slot.width, slot.height, transform, slotRadius);
      
      ctx.restore();

      // Render borders based on preset style
      if (currentPreset.themeId === 'studio-neon') {
        ctx.save();
        ctx.strokeStyle = '#FF007F'; // Neon Pink glow stroke for slot
        ctx.lineWidth = 6;
        ctx.shadowColor = '#FF007F';
        ctx.shadowBlur = 18;
        ctx.beginPath();
        ctx.roundRect(slot.x, slot.y, slot.width, slot.height, slotRadius);
        ctx.stroke();
        ctx.restore();
      } else {
        // Standard subtle border
        ctx.strokeStyle = 'rgba(0,0,0,0.05)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.roundRect(slot.x, slot.y, slot.width, slot.height, slotRadius);
        ctx.stroke();
      }
    }
  });

  // 5. Draw Themed Frame Graphics / Overlays
  if (currentPreset.themeId === 'classic-film') {
    ctx.save();
    // Draw sprocket holes in the left and right margins
    ctx.fillStyle = '#000000'; // Draw holes as dark black cutouts
    const isStrip = layoutId === 'strip-4';
    const numSprockets = isStrip ? 28 : 16;
    const sprocketSpacing = canvas.height / numSprockets;
    const sprocketW = 24;
    const sprocketH = 38;
    const sprocketRadius = 6;
    
    // Margins offset
    const leftMarginCenter = isStrip ? 30 : 50;
    const rightMarginCenter = isStrip ? (canvas.width - 30) : (canvas.width - 50);

    for (let i = 0; i < numSprockets; i++) {
      const sy = i * sprocketSpacing + (sprocketSpacing - sprocketH) / 2;
      
      // Left side hole
      ctx.beginPath();
      ctx.roundRect(leftMarginCenter - sprocketW / 2, sy, sprocketW, sprocketH, sprocketRadius);
      ctx.fill();

      // Right side hole
      ctx.beginPath();
      ctx.roundRect(rightMarginCenter - sprocketW / 2, sy, sprocketW, sprocketH, sprocketRadius);
      ctx.fill();
    }
    ctx.restore();
  } else if (currentPreset.themeId === 'vintage-paper') {
    // Draw Vintage Texture and Vignette Overlay
    ctx.save();
    
    // 1. Noise grain
    const noiseCanvas = createNoiseCanvas(128, 128, 0.07);
    const pattern = ctx.createPattern(noiseCanvas, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    
    // Clean up temporary noise canvas memory
    noiseCanvas.width = 0;
    noiseCanvas.height = 0;
    
    // 2. Vignette shadow overlay
    ctx.globalCompositeOperation = 'multiply';
    const vignette = ctx.createRadialGradient(
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.45,
      canvas.width / 2,
      canvas.height / 2,
      canvas.width * 0.8
    );
    vignette.addColorStop(0, 'rgba(0,0,0,0)');
    vignette.addColorStop(1, 'rgba(92, 74, 60, 0.15)'); // Warm brown vignette edge
    ctx.fillStyle = vignette;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.restore();
  }

  // 6. Draw Outer Border (if specified by preset)
  if (currentPreset.themeId === 'studio-neon') {
    ctx.save();
    ctx.strokeStyle = '#00F0FF'; // Cyber cyan outer frame glow
    ctx.lineWidth = 14;
    ctx.shadowColor = '#00F0FF';
    ctx.shadowBlur = 24;
    ctx.strokeRect(7, 7, canvas.width - 14, canvas.height - 14);
    ctx.restore();
  } else if (currentPreset.borderColor) {
    ctx.strokeStyle = currentPreset.borderColor;
    const borderThickness = layoutId === 'strip-4' ? 6 : 8;
    ctx.lineWidth = borderThickness;
    ctx.strokeRect(
      borderThickness / 2,
      borderThickness / 2,
      canvas.width - borderThickness,
      canvas.height - borderThickness
    );
  }

  // 7. Draw Custom Signature Footer
  ctx.save();
  
  // Custom font matching
  let fontFamily = 'Inter, -apple-system, sans-serif';
  let isCursive = false;
  
  if (footer?.fontFamily === 'Playfair Display') {
    fontFamily = '"Playfair Display", Georgia, serif';
  } else if (footer?.fontFamily === 'JetBrains Mono') {
    fontFamily = '"JetBrains Mono", monospace';
  } else if (footer?.fontFamily === 'Great Vibes') {
    fontFamily = '"Great Vibes", cursive';
    isCursive = true;
  }

  const baseColor = footer?.color || currentPreset.textColor || '#000000';
  ctx.fillStyle = baseColor;
  ctx.textBaseline = 'middle';
  
  // Custom alignment
  let textAlign: CanvasTextAlign = 'center';
  let textX = canvas.width / 2;
  const isStrip = layoutId === 'strip-4';

  if (footer?.alignment === 'left') {
    textAlign = 'left';
    textX = isStrip ? 80 : 120;
  } else if (footer?.alignment === 'right') {
    textAlign = 'right';
    textX = isStrip ? (canvas.width - 80) : (canvas.width - 120);
  }
  ctx.textAlign = textAlign;

  // Font size configuration
  const fontMultiplier = isCursive ? 1.5 : 1.0;
  const baseFontSize = isStrip ? 38 : 48;
  const finalFontSize = Math.round(baseFontSize * fontMultiplier);
  ctx.font = `${isCursive ? '400' : '600'} ${finalFontSize}px ${fontFamily}`;

  // Apply wide letter spacing (disable for script cursives to avoid breakages)
  if ('letterSpacing' in ctx) {
    (ctx as any).letterSpacing = isCursive ? '0.05em' : '0.25em';
  }

  // Calculate text positions
  let textY = 0;
  let dateY = 0;

  if (isStrip) {
    const lastSlotBottom = 2630 + 810; // 3440px
    textY = lastSlotBottom + 65;
    dateY = textY + 48;
  } else {
    const lastSlotBottom = 875 + 645; // 1520px
    textY = lastSlotBottom + 160;
    dateY = textY + 90;
  }

  // Draw Signature line
  const signatureText = footer?.text || 'LUNAGI STUDIOS';
  ctx.fillText(signatureText, textX, textY);

  // Optional Date Stamp
  if (footer?.showDate) {
    ctx.restore();
    ctx.save();
    ctx.textAlign = textAlign;
    ctx.fillStyle = baseColor;
    ctx.globalAlpha = 0.7; // slight fade for secondary text
    ctx.textBaseline = 'middle';
    
    // Choose proportional font size and family for date
    const dateFontSize = isStrip ? 24 : 32;
    const dateFontFamily = footer?.fontFamily === 'JetBrains Mono' ? '"JetBrains Mono", monospace' : 'Inter, -apple-system, sans-serif';
    ctx.font = `500 ${dateFontSize}px ${dateFontFamily}`;
    
    if ('letterSpacing' in ctx) {
      (ctx as any).letterSpacing = '0.15em';
    }

    const firstPhotoDate = selectedPhotos[0]?.capturedAt
      ? new Date(selectedPhotos[0].capturedAt)
      : new Date();
    const yyyy = firstPhotoDate.getFullYear();
    const mm = String(firstPhotoDate.getMonth() + 1).padStart(2, '0');
    const dd = String(firstPhotoDate.getDate()).padStart(2, '0');
    const dateStr = `${yyyy}.${mm}.${dd}`;

    ctx.fillText(dateStr, textX, dateY);
  }

  // 8. Draw Transparent Overlay PNG from Pinterest (if specified)
  if (currentPreset.overlayImageSrc) {
    try {
      const overlayImg = await loadImage(currentPreset.overlayImageSrc);
      ctx.drawImage(overlayImg, 0, 0, canvas.width, canvas.height);
    } catch (err) {
      console.error('Error drawing public transparent overlay frame image:', err);
    }
  }

  ctx.restore();

  return canvas;
};

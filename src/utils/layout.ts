import { FrameLayout, LayoutTemplate, PhotoSlot } from '../types/frames';
import { FrameOverrides } from '../types/booth';

export type GeometryVariant = 'standard' | 'inset-film';

export type Rect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type DerivedLayout = {
  id: FrameLayout;
  outputWidth: number;
  outputHeight: number;
  photoSlots: PhotoSlot[];
  slotRadius: number;
  borderPx: number;
  gapRects: Rect[];
};

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

const roundedRadiusFor = (slot: PhotoSlot, shape: FrameOverrides['cornerShape']) => {
  if (shape === 'square') return 0;
  if (shape === 'pill') return Math.min(slot.width, slot.height) / 2;
  return Math.min(slot.width, slot.height) * 0.035;
};

const computeGapRects = (layoutId: FrameLayout, slots: PhotoSlot[]): Rect[] => {
  if (layoutId === 'strip-4') {
    return slots.slice(0, -1).map((slot, index) => {
      const next = slots[index + 1];
      return {
        x: slot.x,
        y: slot.y + slot.height,
        width: slot.width,
        height: Math.max(0, next.y - (slot.y + slot.height)),
      };
    });
  }

  const topRowBottom = Math.max(slots[0].y + slots[0].height, slots[1].y + slots[1].height);
  const bottomRowTop = Math.min(slots[2].y, slots[3].y);
  return [
    {
      x: Math.min(slots[0].x, slots[2].x),
      y: topRowBottom,
      width: Math.max(slots[1].x + slots[1].width, slots[3].x + slots[3].width) - Math.min(slots[0].x, slots[2].x),
      height: Math.max(0, bottomRowTop - topRowBottom),
    },
  ];
};

export const deriveLayout = (
  template: LayoutTemplate,
  frameOverrides: FrameOverrides,
  geometryVariant: GeometryVariant = 'standard'
): DerivedLayout => {
  const borderPx = clamp(frameOverrides.borderPx, 0, 80);
  const gapDelta = frameOverrides.innerGapPx;
  const width = template.outputWidth;
  const height = template.outputHeight;

  let slots = template.photoSlots.map((slot) => ({ ...slot }));

  if (geometryVariant === 'inset-film' && template.id === 'strip-4') {
    const matteLeft = Math.round(width * 0.13);
    const matteRight = Math.round(width * 0.07);
    slots = slots.map((slot) => ({
      ...slot,
      x: matteLeft + Math.round(width * 0.055),
      width: width - matteLeft - matteRight - Math.round(width * 0.11),
    }));
  }

  if (gapDelta !== 0) {
    if (template.id === 'strip-4') {
      const minY = slots[0].y;
      const bottomLimit = slots[slots.length - 1].y + slots[slots.length - 1].height;
      const available = bottomLimit - minY;
      const gap = clamp(gapDelta, 12, 120);
      const slotHeight = Math.floor((available - gap * 3) / 4);
      slots = slots.map((slot, index) => ({
        ...slot,
        height: slotHeight,
        y: minY + index * (slotHeight + gap),
      }));
    } else {
      const horizontalGap = clamp(gapDelta, 24, 180);
      const verticalGap = clamp(gapDelta, 24, 160);
      const left = slots[0].x;
      const right = template.outputWidth - slots[1].x - slots[1].width;
      const top = slots[0].y;
      const bottom = template.outputHeight - slots[2].y - slots[2].height;
      const slotWidth = Math.floor((template.outputWidth - left - right - horizontalGap) / 2);
      const slotHeight = Math.floor((template.outputHeight - top - bottom - verticalGap) / 2);
      slots = slots.map((slot, index) => ({
        ...slot,
        x: index % 2 === 0 ? left : left + slotWidth + horizontalGap,
        y: index < 2 ? top : top + slotHeight + verticalGap,
        width: slotWidth,
        height: slotHeight,
      }));
    }
  }

  const slotRadius = roundedRadiusFor(slots[0], frameOverrides.cornerShape);

  return {
    id: template.id,
    outputWidth: width,
    outputHeight: height,
    photoSlots: slots,
    slotRadius,
    borderPx,
    gapRects: computeGapRects(template.id, slots),
  };
};

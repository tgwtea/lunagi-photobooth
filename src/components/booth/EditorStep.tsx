import React, { useState } from 'react';
import {
  CustomizationState,
  EffectId,
  FontChoice,
  PhotoTransform,
  PlacedSticker,
  StickerSize,
} from '../../types/booth';
import { FRAME_VISUAL_PRESETS } from '../../data/frameTemplates';
import { FILTER_PRESETS } from '../../data/filterPresets';
import { STICKER_ASSETS } from '../../data/stickers';
import { CapturedPhoto } from '../../types/booth';
import { FramePreview } from './FramePreview';
import { Button } from '../ui/Button';

type EditorStepProps = {
  selectedPhotos: CapturedPhoto[];
  customization: CustomizationState;
  onChangeCustomization: React.Dispatch<React.SetStateAction<CustomizationState>>;
  onChangeTransform: (photoId: string, transform: PhotoTransform) => void;
  onDone: () => void;
};

const EFFECTS: Array<{ id: EffectId | null; name: string }> = [
  { id: null, name: 'None' },
  { id: 'thermal', name: 'Thermal' },
  { id: 'mirror', name: 'Mirror' },
  { id: 'pixelate', name: 'Pixelate' },
  { id: 'vhs', name: 'VHS' },
];

const FONT_CHOICES: FontChoice[] = ['Inter', 'Playfair Display', 'JetBrains Mono', 'Great Vibes'];

const PRESET_GROUPS = ['Classic', 'Retro', 'Pastel', 'Statement'] as const;

const clampCaption = (text: string) => text.slice(0, 24);

export const EditorStep: React.FC<EditorStepProps> = ({
  selectedPhotos,
  customization,
  onChangeCustomization,
  onChangeTransform,
  onDone,
}) => {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);
  const currentPreset =
    FRAME_VISUAL_PRESETS.find((preset) => preset.id === customization.frameId) || FRAME_VISUAL_PRESETS[0];
  const activePhotoIndex = selectedPhotos.findIndex((photo) => photo.id === activePhotoId);
  const activePhoto = activePhotoIndex !== -1 ? selectedPhotos[activePhotoIndex] : null;
  const activeTransform = activePhotoId
    ? customization.photoTransforms[activePhotoId] || { zoom: 1, offsetX: 0, offsetY: 0 }
    : { zoom: 1, offsetX: 0, offsetY: 0 };
  const captionFontLocked = !!currentPreset.captionStyle;

  const updateCustomization = (patch: Partial<CustomizationState>) => {
    onChangeCustomization((prev) => ({ ...prev, ...patch }));
  };

  const updateFrameOverrides = (patch: Partial<CustomizationState['frameOverrides']>) => {
    onChangeCustomization((prev) => ({
      ...prev,
      frameOverrides: { ...prev.frameOverrides, ...patch },
    }));
  };

  const selectFrame = (frameId: string) => {
    const preset = FRAME_VISUAL_PRESETS.find((item) => item.id === frameId);
    onChangeCustomization((prev) => ({
      ...prev,
      frameId,
      filterId: preset?.pairedFilterId || prev.filterId,
    }));
  };

  const updateActiveTransform = (key: keyof PhotoTransform, value: number) => {
    if (!activePhotoId) return;
    onChangeTransform(activePhotoId, {
      ...activeTransform,
      [key]: value,
    });
  };

  const resetActiveTransform = () => {
    if (!activePhotoId) return;
    onChangeTransform(activePhotoId, { zoom: 1, offsetX: 0, offsetY: 0 });
  };

  const addSticker = (assetId: string, size: StickerSize = 'm') => {
    const sticker: PlacedSticker = {
      id: `sticker-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      assetId,
      cx: 0.5,
      cy: 0.5,
      size,
    };
    onChangeCustomization((prev) => ({
      ...prev,
      placedStickers: [...prev.placedStickers, sticker],
    }));
  };

  const updateSticker = (sticker: PlacedSticker) => {
    onChangeCustomization((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.map((item) => (item.id === sticker.id ? sticker : item)),
    }));
  };

  const deleteSticker = (stickerId: string) => {
    onChangeCustomization((prev) => ({
      ...prev,
      placedStickers: prev.placedStickers.filter((item) => item.id !== stickerId),
    }));
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center lg:items-stretch max-w-6xl mx-auto py-4 relative">
      <div className="w-full lg:w-[58%] bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center min-h-[540px] relative">
        <FramePreview
          selectedPhotos={selectedPhotos}
          customization={customization}
          activePhotoId={activePhotoId || undefined}
          onSelectPhoto={setActivePhotoId}
          onChangeTransform={onChangeTransform}
          onChangeSticker={updateSticker}
          onDeleteSticker={deleteSticker}
        />
        <p className="mt-4 font-sans text-xs text-secondary text-center">
          Drag photos to pan. Drag stickers to move; hold a sticker to delete.
        </p>
      </div>

      <div className="w-full lg:w-[42%] flex flex-col justify-between gap-6 bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-6">
          <div className="space-y-1">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-primary">
              Design Your Strip
            </h2>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              Pick a style, tune the look, place stickers, and export.
            </p>
          </div>

          <section className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Layout Format
            </span>
            <div className="flex gap-2 p-1 bg-surface-container w-full rounded-full border border-outline-variant/30">
              {[
                { id: 'strip-4' as const, name: 'Vertical Strip' },
                { id: 'grid-2x2' as const, name: '2x2 Square' },
              ].map((layoutOption) => (
                <button
                  key={layoutOption.id}
                  onClick={() => updateCustomization({ layout: layoutOption.id })}
                  className={`flex-1 py-2 px-4 rounded-full font-sans text-xs font-semibold tracking-wide transition-all duration-300 ${
                    customization.layout === layoutOption.id
                      ? 'bg-white text-primary shadow-sm border border-outline-variant/50'
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {layoutOption.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Style Presets
            </span>
            {PRESET_GROUPS.map((group) => (
              <div key={group} className="space-y-2">
                <div className="font-sans text-[11px] font-semibold text-secondary uppercase tracking-wider">
                  {group}
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {FRAME_VISUAL_PRESETS.filter((preset) => preset.group === group).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => selectFrame(preset.id)}
                      className={`min-h-14 rounded-xl border p-2 text-left transition-all duration-200 ${
                        customization.frameId === preset.id
                          ? 'border-primary ring-2 ring-primary ring-offset-1'
                          : 'border-outline-variant bg-white hover:bg-surface-container-low'
                      }`}
                      title={preset.name}
                    >
                      <div
                        className="w-6 h-6 rounded-full border border-black/10 mb-1"
                        style={{ backgroundColor: preset.backgroundColor }}
                      />
                      <span className="block font-sans text-[10px] font-semibold text-primary leading-tight">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </section>

          <section className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Filters
            </span>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => updateCustomization({ filterId: preset.id })}
                  className={`px-3 py-1.5 rounded-full border font-sans text-xs font-semibold tracking-wide transition-colors ${
                    customization.filterId === preset.id
                      ? 'bg-tertiary-fixed border-primary text-primary'
                      : 'bg-transparent border-outline-variant text-secondary hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  {preset.name}
                </button>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Effects
            </span>
            <div className="flex flex-wrap gap-2">
              {EFFECTS.map((effect) => (
                <button
                  key={effect.name}
                  onClick={() => updateCustomization({ effectId: effect.id })}
                  className={`px-3 py-1.5 rounded-full border font-sans text-xs font-semibold tracking-wide transition-colors ${
                    customization.effectId === effect.id
                      ? 'bg-primary text-white border-primary'
                      : 'bg-transparent border-outline-variant text-secondary hover:bg-surface-container-low hover:text-primary'
                  }`}
                >
                  {effect.name}
                </button>
              ))}
            </div>
          </section>

          <section className="border border-outline-variant rounded-xl p-4 bg-surface-container-low space-y-4">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider block">
              Caption
            </span>
            <input
              type="text"
              value={customization.caption.text}
              onChange={(event) =>
                onChangeCustomization((prev) => ({
                  ...prev,
                  caption: { ...prev.caption, text: clampCaption(event.target.value) },
                }))
              }
              placeholder="JASMINE + THEO"
              className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 font-sans text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <div className="space-y-1">
              <select
                value={customization.caption.fontFamily}
                disabled={captionFontLocked}
                onChange={(event) =>
                  onChangeCustomization((prev) => ({
                    ...prev,
                    caption: { ...prev.caption, fontFamily: event.target.value as FontChoice },
                  }))
                }
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 font-sans text-xs text-primary disabled:text-secondary disabled:bg-surface-container focus:outline-none focus:ring-1 focus:ring-primary"
              >
                {FONT_CHOICES.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              {captionFontLocked && (
                <p className="font-sans text-[11px] text-secondary">
                  This preset uses its own film caption typography.
                </p>
              )}
            </div>
          </section>

          <section className="border border-outline-variant rounded-xl p-4 bg-surface-container-low space-y-4">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider block">
              Custom Frame
            </span>
            <div className="flex items-center gap-3">
              <input
                type="color"
                value={customization.frameOverrides.backgroundColor || currentPreset.backgroundColor}
                onChange={(event) => updateFrameOverrides({ backgroundColor: event.target.value })}
                className="w-8 h-8 rounded-full border border-outline-variant cursor-pointer overflow-hidden p-0 bg-transparent"
              />
              <button
                onClick={() => updateFrameOverrides({ backgroundColor: undefined })}
                className="font-sans text-[11px] font-semibold uppercase px-2 py-1 text-secondary hover:bg-surface rounded"
              >
                Reset Color
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {(['square', 'rounded', 'pill'] as const).map((shape) => (
                <button
                  key={shape}
                  onClick={() => updateFrameOverrides({ cornerShape: shape })}
                  className={`py-2 rounded-lg border font-sans text-xs font-semibold capitalize ${
                    customization.frameOverrides.cornerShape === shape
                      ? 'bg-primary text-white border-primary'
                      : 'border-outline-variant text-secondary bg-white'
                  }`}
                >
                  {shape}
                </button>
              ))}
            </div>
            <label className="block space-y-1">
              <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                <span>Photo Gap</span>
                <span className="font-mono">{customization.frameOverrides.innerGapPx}px</span>
              </div>
              <input
                type="range"
                min="12"
                max="120"
                step="2"
                value={customization.frameOverrides.innerGapPx}
                onChange={(event) => updateFrameOverrides({ innerGapPx: parseInt(event.target.value, 10) })}
                className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
              />
            </label>
            <label className="block space-y-1">
              <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                <span>Border</span>
                <span className="font-mono">{customization.frameOverrides.borderPx}px</span>
              </div>
              <input
                type="range"
                min="0"
                max="40"
                step="1"
                value={customization.frameOverrides.borderPx}
                onChange={(event) => updateFrameOverrides({ borderPx: parseInt(event.target.value, 10) })}
                className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
              />
            </label>
          </section>

          <section className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Stickers
            </span>
            {STICKER_ASSETS.length === 0 ? (
              <p className="font-sans text-xs text-secondary border border-dashed border-outline-variant rounded-xl p-3">
                Drop PNG, WebP, or SVG files into src/assets/stickers and restart the dev server.
              </p>
            ) : (
              <div className="grid grid-cols-4 gap-2">
                {STICKER_ASSETS.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => addSticker(asset.id)}
                    className="aspect-square rounded-xl border border-outline-variant bg-white hover:bg-surface-container-low p-2"
                    title={asset.name}
                  >
                    <img src={asset.src} alt={asset.name} className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        <Button onClick={onDone} variant="primary" className="w-full py-4 mt-4">
          Create Downloads
          <span className="material-symbols-outlined text-[18px]">download</span>
        </Button>
      </div>

      {activePhoto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline-variant max-w-sm w-full p-6 shadow-xl space-y-6">
            <div className="flex justify-between items-center pb-2 border-b border-outline-variant/30">
              <h3 className="font-sans text-lg font-semibold text-primary">
                Crop & Zoom: Photo {activePhotoIndex + 1}
              </h3>
              <button
                onClick={() => setActivePhotoId(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-secondary hover:bg-surface-container-high hover:text-primary transition-colors"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div className="w-full aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden border border-outline-variant relative">
              <img
                src={activePhoto.src}
                alt="Active zoom target"
                className={`w-full h-full object-cover select-none pointer-events-none ${
                  FILTER_PRESETS.find((filter) => filter.id === customization.filterId)?.className || ''
                }`}
                style={{
                  transform: `translate(${activeTransform.offsetX * 100}%, ${activeTransform.offsetY * 100}%) scale(${activeTransform.zoom})`,
                  transformOrigin: 'center center',
                }}
              />
            </div>

            <div className="space-y-4">
              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Zoom Scale</span>
                  <span className="font-mono">{activeTransform.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="2.5"
                  step="0.05"
                  value={activeTransform.zoom}
                  onChange={(event) => updateActiveTransform('zoom', parseFloat(event.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </label>
              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Horizontal</span>
                  <span className="font-mono">{Math.round(activeTransform.offsetX * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={activeTransform.offsetX}
                  onChange={(event) => updateActiveTransform('offsetX', parseFloat(event.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </label>
              <label className="block space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Vertical</span>
                  <span className="font-mono">{Math.round(activeTransform.offsetY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="-1"
                  max="1"
                  step="0.01"
                  value={activeTransform.offsetY}
                  onChange={(event) => updateActiveTransform('offsetY', parseFloat(event.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </label>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={resetActiveTransform}
                className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant font-sans text-xs font-semibold text-secondary hover:bg-surface-container hover:text-primary transition-all duration-200"
              >
                Reset
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-sans text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

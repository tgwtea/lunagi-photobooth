import React, { useState } from 'react';
import { CapturedPhoto, PhotoTransform, FooterCustomization } from '../../types/booth';
import { FrameLayout } from '../../types/frames';
import { LAYOUT_TEMPLATES, FRAME_VISUAL_PRESETS } from '../../data/frameTemplates';
import { FILTER_PRESETS } from '../../data/filterPresets';
import { FramePreview } from './FramePreview';
import { Button } from '../ui/Button';

type EditorStepProps = {
  selectedPhotos: CapturedPhoto[];
  layout: FrameLayout;
  frameId: string;
  filterId: string;
  photoTransforms: Record<string, PhotoTransform>;
  footer: FooterCustomization;
  onChangeLayout: (layout: FrameLayout) => void;
  onChangeFrame: (frameId: string) => void;
  onChangeFilter: (filterId: string) => void;
  onChangeTransform: (photoId: string, transform: PhotoTransform) => void;
  onChangeFooter: (footer: FooterCustomization) => void;
  onDone: () => void;
};

export const EditorStep: React.FC<EditorStepProps> = ({
  selectedPhotos,
  layout,
  frameId,
  filterId,
  photoTransforms,
  footer,
  onChangeLayout,
  onChangeFrame,
  onChangeFilter,
  onChangeTransform,
  onChangeFooter,
  onDone,
}) => {
  const [activePhotoId, setActivePhotoId] = useState<string | null>(null);

  const currentPreset =
    FRAME_VISUAL_PRESETS.find((p) => p.id === frameId) || FRAME_VISUAL_PRESETS[0];
  const currentLayout =
    LAYOUT_TEMPLATES.find((t) => t.id === layout) || LAYOUT_TEMPLATES[0];

  const activePhotoIndex = selectedPhotos.findIndex((p) => p.id === activePhotoId);
  const activePhoto = activePhotoIndex !== -1 ? selectedPhotos[activePhotoIndex] : null;
  const activeTransform = activePhotoId
    ? photoTransforms[activePhotoId] || { zoom: 1.0, offsetX: 0, offsetY: 0 }
    : { zoom: 1.0, offsetX: 0, offsetY: 0 };

  const handleUpdateActiveTransform = (key: keyof PhotoTransform, value: number) => {
    if (!activePhotoId) return;
    onChangeTransform(activePhotoId, {
      ...activeTransform,
      [key]: value,
    });
  };

  const handleResetActiveTransform = () => {
    if (!activePhotoId) return;
    onChangeTransform(activePhotoId, {
      zoom: 1.0,
      offsetX: 0,
      offsetY: 0,
    });
  };

  return (
    <div className="w-full flex flex-col lg:flex-row gap-8 items-center lg:items-stretch max-w-6xl mx-auto py-4 relative">
      
      {/* Left Column: Live Frame Rendering */}
      <div className="w-full lg:w-[60%] bg-surface border border-outline-variant rounded-2xl p-6 flex flex-col items-center justify-center min-h-[500px] relative">
        <FramePreview
          selectedPhotos={selectedPhotos}
          layoutTemplate={currentLayout}
          visualPreset={currentPreset}
          filterId={filterId}
          photoTransforms={photoTransforms}
          activePhotoId={activePhotoId || undefined}
          onSelectPhoto={setActivePhotoId}
          onChangeTransform={onChangeTransform}
          footer={footer}
        />
        <div className="mt-4 text-center">
          <p className="font-sans text-xs text-secondary">
            💡 <span className="font-semibold text-primary">Interactive Panning:</span> Drag photos directly inside the frame, or click to open crop adjustments.
          </p>
        </div>
      </div>

      {/* Right Column: Settings Panel */}
      <div className="w-full lg:w-[40%] flex flex-col justify-between gap-6 bg-surface-container-lowest p-6 border border-outline-variant rounded-2xl max-h-[85vh] overflow-y-auto">
        <div className="space-y-6">
          
          {/* Header Title */}
          <div className="space-y-1">
            <h2 className="font-sans text-2xl font-semibold tracking-tight text-primary">
              Design Your Strip
            </h2>
            <p className="font-sans text-sm text-secondary leading-relaxed">
              Fine-tune layouts, overlay templates, visual filters, and watermarks.
            </p>
          </div>

          {/* Layout Configuration */}
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Layout Format
            </span>
            <div className="flex gap-2 p-1 bg-surface-container w-full rounded-full border border-outline-variant/30">
              <button
                onClick={() => onChangeLayout('strip-4')}
                className={`flex-1 py-2 px-4 rounded-full font-sans text-xs font-semibold tracking-wide transition-all duration-300 ${
                  layout === 'strip-4'
                    ? 'bg-white text-primary shadow-sm border border-outline-variant/50'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                Vertical Strip
              </button>
              <button
                onClick={() => onChangeLayout('grid-2x2')}
                className={`flex-1 py-2 px-4 rounded-full font-sans text-xs font-semibold tracking-wide transition-all duration-300 ${
                  layout === 'grid-2x2'
                    ? 'bg-white text-primary shadow-sm border border-outline-variant/50'
                    : 'text-secondary hover:text-primary'
                }`}
              >
                2x2 Square Grid
              </button>
            </div>
          </div>

          {/* Frame Template Design Selector */}
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Frame Template
            </span>
            <div className="grid grid-cols-5 gap-2">
              {FRAME_VISUAL_PRESETS.map((preset) => {
                const isSelected = preset.id === frameId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChangeFrame(preset.id)}
                    className={`h-11 rounded-xl border flex flex-col items-center justify-center p-1 transition-all duration-200 ${
                      isSelected
                        ? 'border-primary ring-2 ring-primary ring-offset-1 scale-102'
                        : 'border-outline-variant hover:scale-[1.02] bg-white hover:bg-surface-container-low'
                    }`}
                    title={preset.name}
                  >
                    <div
                      className="w-5 h-5 rounded-full border border-black/10 mb-0.5"
                      style={{ backgroundColor: preset.backgroundColor }}
                    />
                    <span className="text-[8px] font-sans font-semibold tracking-tighter truncate max-w-full text-secondary">
                      {preset.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filter Preset Picker */}
          <div className="space-y-3">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider">
              Filter Presets
            </span>
            <div className="flex flex-wrap gap-2">
              {FILTER_PRESETS.map((preset) => {
                const isSelected = preset.id === filterId;
                return (
                  <button
                    key={preset.id}
                    onClick={() => onChangeFilter(preset.id)}
                    className={`px-3 py-1.5 rounded-full border font-sans text-xs font-semibold tracking-wide transition-colors ${
                      isSelected
                        ? 'bg-tertiary-fixed border-primary text-primary'
                        : 'bg-transparent border-outline-variant text-secondary hover:bg-surface-container-low hover:text-primary'
                    }`}
                  >
                    {preset.name}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Signature Watermark Editor Card */}
          <div className="border border-outline-variant rounded-xl p-4 bg-surface-container-low space-y-4">
            <span className="font-sans text-xs font-semibold text-primary uppercase tracking-wider block">
              Signature Footer
            </span>
            
            {/* Signature Text field */}
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] font-semibold text-secondary">Watermark Text</label>
              <input
                type="text"
                value={footer.text}
                onChange={(e) => onChangeFooter({ ...footer, text: e.target.value.slice(0, 30) })}
                placeholder="LUNAGI STUDIOS"
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 font-sans text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            {/* Font family selector */}
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] font-semibold text-secondary">Font Style</label>
              <select
                value={footer.fontFamily}
                onChange={(e) => onChangeFooter({ ...footer, fontFamily: e.target.value })}
                className="w-full bg-white border border-outline-variant rounded-lg px-3 py-2 font-sans text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Inter">Modern Sans-Serif (Inter)</option>
                <option value="Playfair Display">Elegant Serif (Playfair Display)</option>
                <option value="JetBrains Mono">Technical Monospace (JetBrains Mono)</option>
                <option value="Great Vibes">Elegant Cursive (Great Vibes)</option>
              </select>
            </div>

            {/* Alignment buttons */}
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] font-semibold text-secondary block">Text Alignment</label>
              <div className="flex border border-outline-variant rounded-lg overflow-hidden w-fit bg-white">
                {(['left', 'center', 'right'] as const).map((align) => (
                  <button
                    key={align}
                    type="button"
                    onClick={() => onChangeFooter({ ...footer, alignment: align })}
                    className={`px-3 py-2 font-sans text-xs font-semibold uppercase border-r last:border-0 border-outline-variant transition-colors ${
                      footer.alignment === align
                        ? 'bg-[#1A1A1A] text-white'
                        : 'bg-transparent text-secondary hover:bg-surface-container-low'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>

            {/* Custom signature colors */}
            <div className="space-y-1.5">
              <label className="font-sans text-[11px] font-semibold text-secondary block">Signature Color Override</label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  value={footer.color || currentPreset.textColor || '#000000'}
                  onChange={(e) => onChangeFooter({ ...footer, color: e.target.value })}
                  className="w-6 h-6 rounded-full border border-outline-variant/30 cursor-pointer overflow-hidden p-0 bg-transparent"
                />
                <input
                  type="text"
                  placeholder="Default Color"
                  value={footer.color}
                  onChange={(e) => onChangeFooter({ ...footer, color: e.target.value })}
                  className="flex-grow bg-white border border-outline-variant rounded-lg px-3 py-1 font-mono text-xs text-primary focus:outline-none focus:ring-1 focus:ring-primary"
                />
                {footer.color && (
                  <button
                    onClick={() => onChangeFooter({ ...footer, color: '' })}
                    className="font-sans text-xxs font-semibold uppercase px-2 py-1 text-error hover:bg-error/10 rounded"
                  >
                    Reset
                  </button>
                )}
              </div>
            </div>

            {/* Date stamp toggle switch */}
            <div className="pt-2 border-t border-outline-variant/30">
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={footer.showDate}
                  onChange={(e) => onChangeFooter({ ...footer, showDate: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-surface-container rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-outline after:border-outline-variant after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary peer-checked:after:bg-white peer-checked:after:border-none"></div>
                <span className="ml-3 font-sans text-xs font-semibold text-primary">Include Date Stamp</span>
              </label>
            </div>

          </div>

        </div>

        {/* Create CTA Button */}
        <Button
          onClick={onDone}
          variant="primary"
          className="w-full py-4 mt-4"
        >
          Create Downloads
          <span className="material-symbols-outlined text-[18px]">download</span>
        </Button>
      </div>

      {/* Pop-up Overlay Crop Adjustment Modal */}
      {activePhoto && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-surface rounded-2xl border border-outline-variant max-w-sm w-full p-6 shadow-xl space-y-6 animate-in fade-in-50 zoom-in-95 duration-200">
            
            {/* Modal Header */}
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

            {/* Modal Body: Active image layout */}
            <div className="w-full aspect-[4/3] bg-neutral-100 rounded-lg overflow-hidden border border-outline-variant relative">
              <img
                src={activePhoto.src}
                alt="Active zoom target"
                className={`w-full h-full object-cover select-none pointer-events-none ${FILTER_PRESETS.find((f) => f.id === filterId)?.className || ''}`}
                style={{
                  transform: `translate(${activeTransform.offsetX * 100}%, ${activeTransform.offsetY * 100}%) scale(${activeTransform.zoom})`,
                  transformOrigin: 'center center',
                }}
              />
            </div>

            {/* Adjustments: Slider controls */}
            <div className="space-y-4">
              
              {/* Zoom Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Zoom Scale</span>
                  <span className="font-mono">{activeTransform.zoom.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="1.0"
                  max="2.5"
                  step="0.05"
                  value={activeTransform.zoom}
                  onChange={(e) => handleUpdateActiveTransform('zoom', parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </div>

              {/* Offset X Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Horizontal Alignment</span>
                  <span className="font-mono">{Math.round(activeTransform.offsetX * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.01"
                  value={activeTransform.offsetX}
                  onChange={(e) => handleUpdateActiveTransform('offsetX', parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </div>

              {/* Offset Y Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-semibold text-primary font-sans">
                  <span>Vertical Alignment</span>
                  <span className="font-mono">{Math.round(activeTransform.offsetY * 100)}%</span>
                </div>
                <input
                  type="range"
                  min="-1.0"
                  max="1.0"
                  step="0.01"
                  value={activeTransform.offsetY}
                  onChange={(e) => handleUpdateActiveTransform('offsetY', parseFloat(e.target.value))}
                  className="w-full h-1 bg-surface-container rounded-lg appearance-none cursor-pointer accent-[#1A1A1A]"
                />
              </div>

            </div>

            {/* Modal Action Buttons */}
            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetActiveTransform}
                className="flex-1 py-2.5 px-4 rounded-xl border border-outline-variant font-sans text-xs font-semibold text-secondary hover:bg-surface-container hover:text-primary transition-all duration-200"
              >
                Reset Position
              </button>
              <button
                type="button"
                onClick={() => setActivePhotoId(null)}
                className="flex-1 py-2.5 px-4 rounded-xl bg-primary text-white font-sans text-xs font-semibold hover:opacity-90 active:scale-[0.98] transition-all duration-200"
              >
                Apply Changes
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

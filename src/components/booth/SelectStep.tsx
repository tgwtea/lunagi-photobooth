import React from 'react';
import { CapturedPhoto } from '../../types/booth';
import { Button } from '../ui/Button';

type SelectStepProps = {
  photos: CapturedPhoto[];
  selectedPhotoIds: string[];
  onSelectPhoto: (photoId: string) => void;
  onDeselectPhoto: (photoId: string) => void;
  onContinue: () => void;
  onRetake: () => void;
};

export const SelectStep: React.FC<SelectStepProps> = ({
  photos,
  selectedPhotoIds,
  onSelectPhoto,
  onDeselectPhoto,
  onContinue,
  onRetake,
}) => {
  const maxSelections = 4;
  const currentCount = selectedPhotoIds.length;

  const handlePhotoClick = (photoId: string) => {
    const isSelected = selectedPhotoIds.includes(photoId);
    if (isSelected) {
      onDeselectPhoto(photoId);
    } else {
      if (currentCount < maxSelections) {
        onSelectPhoto(photoId);
      } else {
        // Subtle trigger: could add shake or alert. For now we just ignore or show visual warning
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center gap-8">
      {/* Header Info */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <h1 className="font-sans text-3xl font-semibold tracking-tight text-primary">
          Choose your favourite 4
        </h1>
        <p className="font-sans text-sm text-secondary">
          Tap in the order you want them to appear on the final print.
        </p>
      </div>

      {/* Grid of 8 captured photos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-gutter w-full max-w-5xl">
        {photos.map((photo) => {
          const selectionIndex = selectedPhotoIds.indexOf(photo.id);
          const isSelected = selectionIndex > -1;
          const isDisabled = !isSelected && currentCount >= maxSelections;

          return (
            <button
              key={photo.id}
              onClick={() => handlePhotoClick(photo.id)}
              disabled={isDisabled}
              className={`relative aspect-[3/4] rounded-xl overflow-hidden border-2 transition-all duration-300 group focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 bg-surface-container-low ${
                isSelected
                  ? 'border-primary scale-[0.98]'
                  : 'border-transparent hover:border-outline hover:scale-[1.01] disabled:opacity-40 disabled:cursor-not-allowed'
              }`}
            >
              {/* Photo Image */}
              <img
                src={photo.src}
                alt="Captured pose"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />

              {/* Selection Badge Overlay */}
              <div
                className={`absolute top-4 right-4 w-8 h-8 rounded-full flex items-center justify-center font-sans text-xs font-bold shadow-sm transition-all duration-300 ${
                  isSelected
                    ? 'bg-tertiary-fixed text-primary scale-100 opacity-100'
                    : 'bg-white/70 text-secondary scale-50 opacity-0'
                }`}
              >
                {selectionIndex + 1}
              </div>

              {/* Selection Outline Hint */}
              {isSelected && (
                <div className="absolute inset-0 border border-primary/20 pointer-events-none rounded-[10px]"></div>
              )}
            </button>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex flex-col md:flex-row gap-4 mt-8 w-full max-w-md mx-auto">
        <Button
          onClick={onRetake}
          variant="secondary"
          className="w-full py-4"
        >
          Retake Session
        </Button>
        <Button
          onClick={onContinue}
          variant="primary"
          className="w-full py-4"
          disabled={currentCount !== maxSelections}
        >
          Continue ({currentCount}/{maxSelections})
        </Button>
      </div>
    </div>
  );
};

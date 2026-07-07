import React, { useState, useRef } from 'react';
import { useKiosk } from '../../context/KioskContext';

type SiteHeaderProps = {
  onBack?: () => void;
  backText?: string;
  showNav?: boolean;
  actionText?: string;
  onAction?: () => void;
};

export const SiteHeader: React.FC<SiteHeaderProps> = ({
  onBack,
  backText = 'Back',
  showNav = true,
  actionText,
  onAction,
}) => {
  const { kioskActive, setShowAdminModal } = useKiosk();
  const [clickCount, setClickCount] = useState(0);
  const lastClickTimeRef = useRef<number>(0);

  const handleBrandClick = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTimeRef.current > 3000) {
      setClickCount(1);
    } else {
      e.preventDefault();
      const nextCount = clickCount + 1;
      setClickCount(nextCount);
      if (nextCount >= 5) {
        setShowAdminModal(true);
        setClickCount(0);
      }
    }
    lastClickTimeRef.current = now;
  };

  const shouldShowBack = onBack && !kioskActive;

  return (
    <header className="bg-surface border-b border-outline-variant w-full top-0 z-50 sticky select-none">
      <div className="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop h-20 max-w-container-max mx-auto">
        {/* Left Section: Back button or wordmark */}
        <div className="flex items-center min-w-[80px]">
          {shouldShowBack ? (
            <button
              onClick={onBack}
              className="inline-flex items-center gap-1.5 text-secondary hover:text-primary transition-colors duration-200"
            >
              <span className="material-symbols-outlined text-lg leading-none" style={{ fontVariationSettings: "'FILL' 0" }}>
                arrow_back
              </span>
              <span className="font-sans text-xs font-semibold uppercase tracking-wider">{backText}</span>
            </button>
          ) : (
            <a
              className="font-sans font-medium text-lg tracking-[0.15em] text-primary cursor-pointer select-none"
              href="#/"
              onClick={handleBrandClick}
            >
              LUNAGI STUDIOS
            </a>
          )}
        </div>

        {/* Middle Section: Center Brand if Back button is present, otherwise Navigation */}
        {shouldShowBack ? (
          <div
            className="font-sans font-medium text-lg tracking-[0.15em] text-primary cursor-pointer select-none"
            onClick={handleBrandClick}
          >
            LUNAGI STUDIOS
          </div>
        ) : (
          showNav && (
            <nav className="hidden md:flex gap-8 items-center">
              <a
                className="font-sans text-sm font-semibold tracking-wider text-secondary hover:text-primary transition-colors duration-200"
                href="#how-it-works"
              >
                How it works
              </a>
              <a
                className="font-sans text-sm font-semibold tracking-wider text-secondary hover:text-primary transition-colors duration-200"
                href="#privacy"
              >
                Privacy
              </a>
            </nav>
          )
        )}

        {/* Right Section: Action Button or Spacer */}
        <div className="flex justify-end min-w-[80px]">
          {actionText && onAction && !kioskActive ? (
            <button
              onClick={onAction}
              className="bg-primary text-on-primary font-sans text-xs font-semibold tracking-wider px-6 py-3 rounded-full hover:opacity-85 transition-opacity"
            >
              {actionText}
            </button>
          ) : (
            // Empty spacer to keep balance
            <div className="w-10"></div>
          )}
        </div>
      </div>
    </header>
  );
};


import React from 'react';
import { Button } from '../ui/Button';

type IdleWarningModalProps = {
  isOpen: boolean;
  secondsRemaining: number;
  onKeepPlaying: () => void;
};

export const IdleWarningModal: React.FC<IdleWarningModalProps> = ({
  isOpen,
  secondsRemaining,
  onKeepPlaying,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-md z-[90] flex items-center justify-center p-4 select-none">
      <div className="bg-[#FAF9F9] border border-[#e9e8e7] rounded-2xl w-full max-w-sm overflow-hidden shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-[#efeded] border border-[#c4c7c7] flex items-center justify-center text-primary relative">
            <span className="material-symbols-outlined text-[32px]">timer</span>
            <div className="absolute -top-1 -right-1 bg-primary text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border border-white">
              {secondsRemaining}
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-sans text-lg font-semibold text-[#1b1c1c]">Still there?</h3>
          <p className="font-sans text-xs text-[#5e5e5e] leading-relaxed">
            Your photobooth session will reset in <span className="font-bold text-primary">{secondsRemaining}s</span>.
          </p>
        </div>

        <Button variant="primary" className="w-full py-3.5" onClick={onKeepPlaying}>
          I'm still here
        </Button>
      </div>
    </div>
  );
};

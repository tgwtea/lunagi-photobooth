import React from 'react';
import { Button } from '../ui/Button';

type PreviewStepProps = {
  onStartSession: () => void;
};

export const PreviewStep: React.FC<PreviewStepProps> = ({
  onStartSession,
}) => {
  return (
    <div className="w-full flex flex-col items-center">
      {/* Immersive Studio Preview Container */}
      <div className="relative w-full max-w-2xl aspect-[3/4] md:aspect-video rounded-2xl overflow-hidden bg-[#1A1A1A] shadow-2xl flex flex-col justify-end group border border-[#E5E5E5]/10">
        
        {/* Camera Feed Mock Graphic */}
        <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-neutral-900 overflow-hidden">
          {/* Subtle gradient background representing studio screen */}
          <div className="absolute inset-0 bg-gradient-to-tr from-neutral-800 to-neutral-950 opacity-90"></div>
          
          {/* Minimalist studio flash stand / ring light representation */}
          <div className="relative w-[300px] h-[300px] rounded-full border border-white/5 flex items-center justify-center opacity-40 animate-pulse duration-[3000ms]">
            <div className="w-[200px] h-[200px] rounded-full border border-white/10 flex items-center justify-center">
              <div className="w-[100px] h-[100px] rounded-full bg-white/5 blur-xl"></div>
            </div>
          </div>

          <div className="absolute flex flex-col items-center gap-3 text-white/40 select-none">
            <span className="material-symbols-outlined text-[64px]" style={{ fontVariationSettings: "'FILL' 0, 'wght' 200" }}>
              linked_camera
            </span>
            <span className="font-sans text-xs tracking-[0.2em] font-medium">CAMERA READY</span>
          </div>
        </div>

        {/* Technical Portrait Crop Guide */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative w-3/4 md:w-[42%] aspect-[3/4] border border-white/20">
            {/* Corner Marks (Hairlines) */}
            <div className="absolute w-6 h-6 crop-corner-tl"></div>
            <div className="absolute w-6 h-6 crop-corner-tr"></div>
            <div className="absolute w-6 h-6 crop-corner-bl"></div>
            <div className="absolute w-6 h-6 crop-corner-br"></div>
            
            {/* Crosshair Center */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 opacity-30">
              <div className="absolute top-1/2 left-0 w-full h-[0.5px] bg-white -translate-y-1/2"></div>
              <div className="absolute top-0 left-1/2 w-[0.5px] h-full bg-white -translate-x-1/2"></div>
            </div>
          </div>
        </div>

        {/* Overlay Controls & Info */}
        <div className="relative z-10 w-full p-8 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col items-center text-center text-white mt-auto">
          <p className="font-sans text-xl md:text-2xl font-medium tracking-tight mb-2">Stay inside the frame.</p>
          <p className="font-sans text-sm text-white/70 mb-8 max-w-md">8 timed photos. Choose your favourite 4.</p>
          
          <Button
            onClick={onStartSession}
            variant="primary"
            className="bg-white text-black hover:bg-neutral-100 transition-colors w-full sm:w-auto min-w-[240px] py-4"
          >
            Start Session
            <span className="material-symbols-outlined text-[18px]">photo_camera</span>
          </Button>
        </div>

        {/* Status Indicator */}
        <div className="absolute top-6 right-6 flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
          <span className="font-sans text-[10px] font-semibold text-white/80 uppercase tracking-widest">Ready</span>
        </div>
      </div>

      {/* Privacy Guarantee Reminder */}
      <div className="mt-8 text-center text-secondary font-sans text-xs tracking-wide max-w-lg mx-auto opacity-70 flex items-center justify-center gap-1">
        <span className="material-symbols-outlined text-sm">lock</span>
        <span>Your photos are processed locally on your device.</span>
        <a className="underline hover:text-primary transition-colors ml-1" href="#privacy">Privacy policy</a>
      </div>
    </div>
  );
};
